using CarbonTC.Auth.Application.Interfaces;
using CarbonTC.Auth.Domain.Common;
using MediatR;
using Microsoft.Extensions.Logging;

namespace CarbonTC.Auth.Application.Features.Auth.Commands.ForgotPassword;

public class ForgotPasswordHandler : IRequestHandler<ForgotPasswordCommand, ApiResponse<string>>
{
    private readonly IUserRepository _userRepository;
    private readonly ILogger<ForgotPasswordHandler> _logger;

    public ForgotPasswordHandler(IUserRepository userRepository, ILogger<ForgotPasswordHandler> logger)
    {
        _userRepository = userRepository;
        _logger = logger;
    }

    public async Task<ApiResponse<string>> Handle(ForgotPasswordCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByEmailAsync(request.Email);
        if (user == null)
        {
            return ApiResponse<string>.ErrorResult("Không tìm thấy tài khoản với email này", "User not found");
        }

        Random random = new Random();
        string otp = random.Next(100000, 999999).ToString();

        user.ResetToken = otp;
        user.ResetTokenExpiry = DateTime.UtcNow.AddMinutes(5);

        await _userRepository.UpdateAsync(user);

        return ApiResponse<string>.SuccessResult(otp, "Mã OTP đã được tạo thành công");
    }
}
