# 사전예약 이메일 저장 Worker

랜딩 페이지(`preorder/`)의 이메일 칸이 이 Worker로 주소를 보낸다. Workers KV에 주소 하나당 키 하나로 저장한다 (값은 신청 시각). 같은 주소는 한 번만 저장한다.

## 처음 배포 (한 번만)

```
cd preorder-worker
npx wrangler login
npx wrangler kv namespace create PREORDERS   # 나온 id를 wrangler.jsonc의 REPLACE_WITH_KV_ID 자리에
npx wrangler deploy                          # 나온 주소(https://repup-preorder.<계정>.workers.dev)를
```

배포 주소를 `preorder/index.html`의 `<form ... data-endpoint="">`에 넣는다. 페이지를 GitHub Pages가 아닌 다른 주소에서 열면 `ALLOWED_ORIGINS`에 그 주소를 쉼표로 더한다.

## 신청 목록 보기

```
npx wrangler kv key list --binding PREORDERS --remote
```

출시 알림을 보낸 뒤에는 페이지에 적은 대로 목록을 지운다 (Cloudflare 대시보드 Workers KV에서 namespace 삭제).
