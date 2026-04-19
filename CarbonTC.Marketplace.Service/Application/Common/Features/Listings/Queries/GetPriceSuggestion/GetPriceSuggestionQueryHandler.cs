using Application.Common.Interfaces;
using Domain.Common.Response;
using MediatR;
using Microsoft.Extensions.Logging;

namespace Application.Common.Features.Listings.Queries.GetPriceSuggestion
{
    public class GetPriceSuggestionQueryHandler : IRequestHandler<GetPriceSuggestionQuery, Result<float>>
    {
        private readonly ICarbonPricingService _carbonPricing;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ICarbonLifecycleServiceClient _carbonLifecycleService;
        private readonly ICacheService _cacheService;
        private readonly ILogger<GetPriceSuggestionQueryHandler> _logger;
        private readonly IFXRatesServiceClient _fXRates;

        public GetPriceSuggestionQueryHandler(
            ICarbonPricingService carbonPricing, 
            IUnitOfWork unitOfWork, 
            ICarbonLifecycleServiceClient carbonLifecycleService, 
            ICacheService cacheService, 
            ILogger<GetPriceSuggestionQueryHandler> logger,
            IFXRatesServiceClient fXRates)
        {
            _carbonPricing = carbonPricing;
            _unitOfWork = unitOfWork;
            _carbonLifecycleService = carbonLifecycleService;
            _cacheService = cacheService;
            _logger = logger;
            _fXRates = fXRates;
        }

        public async Task<Result<float>> Handle(GetPriceSuggestionQuery request, CancellationToken cancellationToken)
        {
            string verificationStandard = "VERRA";
            int vintage = DateTime.UtcNow.Year;
            float quantity = 0;

            if (request.CreditId == null || request.CreditId == Guid.Empty)
            {
                _logger.LogInformation("Using generic suggestion mode because creditId is empty.");
            }
            else
            {
                var creditToSell = await _unitOfWork.CreditInventories.GetByCreditIdAsync(request.CreditId.Value);
                if (creditToSell != null)
                {
                    quantity = (float)creditToSell.AvailableAmount;
                }
                else
                {
                    _logger.LogWarning("Credit inventory not found for {CreditId}. Falling back to generic quantity.", request.CreditId.Value);
                }

                var cvaStandards = await _carbonLifecycleService.GetCVAStandardsAsync(request.CreditId.Value, cancellationToken);
                if (cvaStandards != null)
                {
                    if (!string.IsNullOrWhiteSpace(cvaStandards.StandardName))
                    {
                        verificationStandard = cvaStandards.StandardName;
                    }

                    if (cvaStandards.EffectiveDate != default)
                    {
                        vintage = cvaStandards.EffectiveDate.Year;
                    }
                }
                else
                {
                    _logger.LogWarning("CVA standard not found for {CreditId}. Falling back to generic standard/vintage.", request.CreditId.Value);
                }
            }

            var creditType = "RenewableEnergy";

            // Fetch market supply and demand from cache
            var supplyKey = $"market:supply:{creditType}";
            var demandKey = $"market:demand:{creditType}";

            var marketSupply = await _cacheService.GetStringAsync<float>(supplyKey);
            var marketDemand = await _cacheService.GetStringAsync<float>(demandKey);
            if (marketSupply == 0 || marketDemand == 0)
            {
                _logger.LogWarning("Cache miss for market data. Recalculating...");

                var supplyTask = await _unitOfWork.CreditInventories.GetTotalSupplyByTypeAsync(cancellationToken);
                var demandTask = await _unitOfWork.Listings.GetTotalDemandByTypeAsync(cancellationToken);

                marketSupply = (float)supplyTask;
                marketDemand = (float)demandTask;

                var ttl = TimeSpan.FromMinutes(10);
                await _cacheService.SetStringAsync(supplyKey, marketSupply, ttl);
                await _cacheService.SetStringAsync(demandKey, marketDemand, ttl);
            }

            var predictedPrice = await _carbonPricing.PredictPrice(
                creditType,
                verificationStandard,
                vintage,
                (float)quantity,
                (float)marketSupply,
                (float)marketDemand
            );

            var fxResult = await _fXRates.GetRateAsync("usd", "vnd", cancellationToken);

            return Result<float>.Success((float)fxResult * predictedPrice);
        }
    }
}
