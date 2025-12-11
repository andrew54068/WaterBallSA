Feature: 用戶認證

  Background:
    Given 準備一個User, with table:
      | >User.id | googleId              | email             | name     |
      | <userId  | 108123456789012345678 | user@test.com     | TestUser |

  Rule: 使用者可以使用 Google OAuth 登入
    Example: Google 登入成功應回傳 JWT Tokens
      When (No Actor) Google OAuth 登入, call table:
        | googleIdToken                                                                            |
        | "eyJhbGciOiJSUzI1NiIsImtpZCI6IjE5ZmUyYTdiNjc5NTIzOTYwNmNhMGE3NTA3OTRhN2JkOWZkOTU5NjEi" |
      Then 回應, with table:
        | >accessToken | >refreshToken | tokenType | expiresIn |
        | <accessToken | <refreshToken | Bearer    | 900       |
      And 應該存在一個User, with table:
        | id      | googleId              | email         | name     |
        | $userId | 108123456789012345678 | user@test.com | TestUser |

  Rule: 使用者可以刷新 Access Token
    Example: 使用有效的 Refresh Token 刷新 Access Token
      Given 已經登入, with table:
        | >refreshToken |
        | <refreshToken |
      When (No Actor) 刷新 Access Token, call table:
        | refreshToken  |
        | $refreshToken |
      Then 回應, with table:
        | >newAccessToken | tokenType | expiresIn |
        | <newAccessToken | Bearer    | 900       |

  Rule: 使用者可以查看個人資訊
    Example: 帶有 Token 請求個人資訊應成功
      Given (UID="$User.id") 已經登入
      When (UID="$User.id") 取得當前使用者資訊, call table:
        | >ignored |
        |          |
      Then 回應, with table:
        | id      | googleId              | email         | name     |
        | $userId | 108123456789012345678 | user@test.com | TestUser |

  Rule: 使用者可以登出
    Example: 登出應成功
      Given (UID="$User.id") 已經登入
      When (UID="$User.id") 登出
      Then 回應, with table:
        | message           |
        | Logout successful |

  Rule: 登入失敗處理
    Example: 使用無效的 Google ID Token 登入應失敗 (401)
      When (No Actor) Google OAuth 登入, call table:
        | googleIdToken |
        | invalid_token |
      Then 回應, with table:
        | status | error        |
        | 401    | Unauthorized |
