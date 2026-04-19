using CarbonTC.Auth.Domain.Common;
using MediatR;

namespace CarbonTC.Auth.Application.Features.Auth.Commands.ForgotPassword;

public record ForgotPasswordCommand(string Email) : IRequest<ApiResponse<string>>;
