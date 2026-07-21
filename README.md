# mdl-site

MDL 研究室紹介サイト(https://mdl.comp.isct.ac.jp)のリポジトリ。

## 構成

- **ホスティング**: GitHub Pages(このリポジトリの `main` ブランチのルートをそのまま配信。ビルドなし)
- **ドメイン**: `mdl.comp.isct.ac.jp`(`CNAME` ファイル + リポジトリの Pages 設定で指定)
- **CMS**: [Sveltia CMS](https://github.com/sveltia/sveltia-cms)(Decap CMS 互換。`/admin/` からブラウザで編集 → このリポジトリに直接コミットされる)

```
index.html              … トップページ(現状プレースホルダ。自由に差し替え可)
CNAME                   … カスタムドメイン指定(GitHub Pages 用。消さないこと)
.nojekyll               … Jekyll ビルドの無効化(素の HTML 配信)
admin/index.html        … Sveltia CMS 本体の読み込み
admin/config.yml        … CMS の設定(Decap 互換形式。コレクション定義はプレースホルダ)
content/news/           … ニュース記事(Markdown, CMS が管理)
content/publications/   … 論文エントリ(Markdown, CMS が管理)
assets/uploads/         … CMS からアップロードした画像等
```

## CMS の認証(OAuth 中継なし構成)

OAuth 中継サーバーは**使っていない**。各編集者は `/admin/` のログイン画面で
**「Sign In with Token」**を選び、自分の GitHub Personal Access Token でログインする。

- 編集できるのは、**このリポジトリに write 権限を持つ GitHub アカウント**のみ
- PAT はログイン画面のリンクから必要スコープ選択済みで発行できる(fine-grained token、
  対象リポジトリを mdl-lab/mdl-site に絞るのを推奨)。有効期限(既定90日)が切れたら再発行
- 将来ワンクリックの GitHub ログインにしたい場合は、OAuth 中継(自前コンテナ or
  Cloudflare Workers の [sveltia-cms-auth](https://github.com/sveltia/sveltia-cms-auth))を立てて
  `admin/config.yml` の backend に `base_url` を追加すれば切り替えられる

## 本番公開までのアクセス制限について(重要)

**GitHub Pages には Basic 認証を設定できない**(静的配信のみでサーバー処理がないため。
アクセス制限付き Pages は Enterprise 限定)。また、リポジトリが public の間は
**Pages でどう隠しても内容はリポジトリ自体から閲覧できる**。したがって公開前の保護は
以下の組み合わせで行う:

1. **トップページは旧サイトへの暫定リダイレクト**(現状の `index.html`)— 一般訪問者には未公開に見える
2. **`robots.txt` で全クローラ拒否 + 各ページに `noindex`** — 検索エンジンに載せない
3. **公開前に見られて困るコンテンツ(未発表情報など)は `main` に置かない** — これが唯一確実な保護
4. **Basic 認証付きでデザインをプレビューしたい場合**は、GitHub Pages ではなく
   tamagotake 上のステージング(`deploy/staging/` 参照。kpro と同じ nginx + Basic 認証方式)を使う

## 新サイトの公開手順(引き継ぎメモ)

現在の `index.html` は**旧サイト(Google Sites)への暫定リダイレクト**。DNS はすでに
GitHub Pages を向いているが、訪問者は従来どおり旧サイトに飛ぶため、見た目上は未公開状態。

- **公開する**:
  1. `index.html` を本番のトップページに差し替える
  2. `robots.txt` をクローラ許可版(`User-agent: *` + `Disallow:` 空)に差し替え、
     各ページの `<meta name="robots" content="noindex">` を外す(`admin/` は noindex のままでよい)
  3. `main` に push(数十秒で反映)
- **ロールバック**: リダイレクト版の `index.html` に戻して push するだけ

## コンテンツの扱い(引き継ぎメモ)

- `admin/config.yml` の `collections:` 以下はサンプル。サイト設計が決まったらフィールド構成を変更してよい
- 現状は SSG(静的サイトジェネレータ)を使っていないため、`content/` 以下の Markdown を
  トップページに表示するには、①JS で fetch して描画する、②SSG(Eleventy 等)+ GitHub Actions を導入する、
  のどちらかを HTML 担当者が選ぶこと。SSG を入れる場合は Pages の配信元を Actions に切り替える

## DNS

`mdl.comp.isct.ac.jp` は **A レコード4件**で GitHub Pages の公式 IP
(185.199.108.153 / 109.153 / 110.153 / 111.153)に向ける。
**CNAME は使わないこと** — 同名に MX レコード(メール: filter.nap.gsic.titech.ac.jp)が
登録されており、CNAME を同居させるとゾーン全体が無効化される。MX には触らない。

- 旧設定: A 131.112.16.160(tamagotake。Google Sites へ 301 リダイレクトしていた)
- `kpro.mdl.comp.isct.ac.jp` は独立の A レコードなので影響なし
