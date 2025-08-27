export const verifyLogout = (req, res) => {
    res
      .status(200)
      .clearCookie('accessToken', { path: '/' })
      .clearCookie('refreshToken', { path: '/' })
      .json({ message: 'User logged out successfully' });
  };
  