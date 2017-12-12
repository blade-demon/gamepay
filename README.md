# gamepay - 游戏付费与公众号付费
用户在主机上进行游戏后，需要付费的时候，扫描主机的二维码进入付费流程，付费完成后，主机推送游戏code。用户在主机上输入code，解锁游戏。

# 部署步骤
    - git clone https://github.com/blade-demon/gamepay.git
    - npm i
    - sudo apt-get update
    - sudo apt-get install 
    - 创建游戏
    - 注册设备


## 游戏登录调用接口
- POST https://gamepay-ziweigamepoch.c9users.io/services/login   {  mac, gameId, gameName, time }

## 游戏失败调用接口
- POST https://gamepay-ziweigamepoch.c9users.io/services/failed   { gameId, mac, time }

## 检查用户输入的code是否合法
- POST https://gamepay-ziweigamepoch.c9users.io/services/check   { code, recordId }

## 游戏失败调用该接口
- POST https://gamepay-ziweigamepoch.c9users.io/services/writecode  { recordId }

## 游戏失败，用户扫描二维码付费（微信服务器API）
- url, mac
- POST https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxf2e552a466a5ea08&redirect_uri=http%3a%2f%2fwechatservice.gamepoch.com%2fusers%2fgamepay%3fmac%3d54%3a52%3a00%3a93%3ad6%3a97&response_type=code&scope=snsapi_userinfo&state=state&connect_redirect=1&uin=NDMxNzQ4MjM1&key=3469da023fd7d124fb1bba8deb68a68dcaef5136583e2956916b6e42299990b976f9dbc45d26794d31279472597a8ba6&pass_ticket=u2p0afxKt+/d5C3SJYwE60oqybqVfN4/TS0Xw00ntjhbI/yaaUO51VUJN+t66AdWRWKnciaV/i1wyjgUDDQ4Lg==&uin=NDMxNzQ4MjM1&key=3469da023fd7d124dfe654eef6e553854d21fd968742cabb539ab7d427f123869054aa6927e18e7e4e15f27c86fac6b4&pass_ticket=u2p0afxKt+/d5C3SJYwE60oqybqVfN4/TS0Xw00ntjhbI/yaaUO51VUJN+t66AdWRWKnciaV/i1wyjgUDDQ4Lg==
