在 Mac 终端中按下面步骤操作。密钥需要添加到**有目标仓库写入权限的 GitHub 账号**。

1. 生成 SSH 密钥（邮箱替换成你的 GitHub 邮箱）：

   ```bash
   ssh-keygen -t ed25519 -C "你的GitHub邮箱" -f ~/.ssh/id_ed25519_github
   ```

   按提示设置密码。如果提示文件已存在，先取消，不要覆盖已有密钥。

2. 将密钥加入 macOS 钥匙串：

   ```bash
   ssh-add --apple-use-keychain ~/.ssh/id_ed25519_github
   ```

3. 复制公钥：

   ```bash
   pbcopy < ~/.ssh/id_ed25519_github.pub
   ```

4. 打开 [GitHub SSH 密钥设置](https://github.com/settings/keys)，点击 **New SSH key**：
   - Title：填写 `我的 Mac`
   - Key type：选择 `Authentication Key`
   - Key：粘贴刚复制的公钥，然后保存

   只上传 `.pub` 公钥，私钥文件不要分享。

5. 打开 SSH 配置文件：

   ```bash
   mkdir -p ~/.ssh
   nano ~/.ssh/config
   ```

   添加以下配置；如果已有 `Host github.com`，修改原有配置，避免重复：

   ```sshconfig
   Host github.com
     HostName github.com
     User git
     IdentityFile ~/.ssh/id_ed25519_github
     AddKeysToAgent yes
     UseKeychain yes
   ```

   按 `Control + O`、回车保存，再按 `Control + X` 退出。

6. 测试连接：

   ```bash
   ssh -T git@github.com
   ```

   首次连接可能提示确认主机。成功后应显示 `Hi 用户名! You've successfully authenticated...`，确认用户名是有仓库权限的账号。

7. 上传项目：

   ```bash
   cd /Users/wangteng3/projects/local-test-dev-handoff
   git push -u origin main
   ```

本地提交和远程地址已经配置好了，无需重新提交。