using CarbonTC.Auth.Domain.Common;
using MediatR;

namespace CarbonTC.Auth.Application.Features.Auth.Commands.ResetPassword;

public record ResetPasswordCommand(string Email, string Otp, string NewPassword) : IRequest<ApiResponse>;
