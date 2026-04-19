using CarbonTC.Auth.Application.Interfaces;
using CarbonTC.Auth.Domain.Common;
using MediatR;
using Microsoft.Extensions.Logging;

namespace CarbonTC.Auth.Application.Features.Auth.Commands.ResetPassword;

public class ResetPasswordHandler : IRequestHandler<ResetPasswordCommand, ApiResponse>
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ILogger<ResetPasswordHandler> _logger;

    public ResetPasswordHandler(
        IUserRepository userRepository,
        IPasswordHasher passwordHasher,
        ILogger<ResetPasswordHandler> logger)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
        _logger = logger;
    }

    public async Task<ApiResponse> Handle(ResetPasswordCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByEmailAsync(request.Email);
        if (user == null)
        {
            return ApiResponse.ErrorResult("Không tìm thấy tài khoản với email này", "User not found");
        }

        if (user.ResetToken != request.Otp)
        {
            return ApiResponse.ErrorResult("Mã OTP không hợp lệ", "Invalid OTP");
        }

        if (!user.ResetTokenExpiry.HasValue || user.ResetTokenExpiry.Value < DateTime.UtcNow)
        {
            return ApiResponse.ErrorResult("Mã OTP đã hết hạn", "Expired OTP");
        }

        user.PasswordHash = _passwordHasher.HashPassword(request.NewPassword);
        user.ResetToken = null;
        user.ResetTokenExpiry = null;

        await _userRepository.UpdateAsync(user);

        return ApiResponse.SuccessResult("Khôi phục mật khẩu thành công");
    }
}
