# Basic 認証付きステージング(tamagotake)

本番公開前のデザイン確認用。GitHub Pages は Basic 認証を設定できないため、
閲覧制限付きプレビューはこちらで行う(kpro と同じ nginx + Basic 認証パターン)。

構成: `staging.mdl.comp.isct.ac.jp` → ホスト nginx (443, certbot) → 127.0.0.1:8095 →
nginx:alpine コンテナがこのリポジトリの checkout を配信。

## 初回セットアップ(tamagotake 上で)

```bash
# 1. リポジトリを配置
sudo mkdir -p /opt/mdl-site && sudo chown "$USER" /opt/mdl-site
git clone https://github.com/mdl-lab/mdl-site.git /opt/mdl-site

# 2. Basic 認証のユーザー作成(パスワードを聞かれる)
sudo apt-get install -y apache2-utils
htpasswd -c /opt/mdl-site/deploy/staging/htpasswd mdl

# 3. コンテナ起動
cd /opt/mdl-site/deploy/staging && sudo docker compose up -d
curl -s http://127.0.0.1:8095/healthz   # → ok

# 4. ホスト nginx にバーチャルホスト追加
sudo cp /opt/mdl-site/deploy/staging/staging.mdl.comp.isct.ac.jp.conf \
        /etc/nginx/sites-available/mdl-staging
sudo ln -s /etc/nginx/sites-available/mdl-staging /etc/nginx/sites-enabled/mdl-staging
sudo nginx -t && sudo systemctl reload nginx

# 5. DNS: staging.mdl.comp.isct.ac.jp の A レコードを 131.112.16.160 に向ける

# 6. 証明書取得(DNS 反映後)
sudo certbot --nginx -d staging.mdl.comp.isct.ac.jp
```

## 更新の反映

ステージングは checkout をそのまま配信しているので、pull するだけ:

```bash
cd /opt/mdl-site && git pull
```

自動化するなら crontab に(5分ごと):

```
*/5 * * * * cd /opt/mdl-site && git pull -q
```

## 廃止(本番公開後)

```bash
cd /opt/mdl-site/deploy/staging && sudo docker compose down
sudo rm /etc/nginx/sites-enabled/mdl-staging && sudo nginx -t && sudo systemctl reload nginx
```

DNS の staging レコードと `/opt/mdl-site` も不要なら削除。

## 注意

- `htpasswd` ファイルはコミットしないこと(`.gitignore` 済み)
- ここはあくまで「閲覧制限付きプレビュー」。リポジトリ自体が public の間は、
  ソースは誰でも見られる点に変わりはない(未発表情報は main に置かない)
