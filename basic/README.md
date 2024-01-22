# 인프런 Svelte.js [Core API] 완벽 가이드 수업듣고 정리 
## (https://inf.run/Mk4D)

### 섹션 0. 개요

### 섹션 1. 시작하기
- 선언적 렌더링
- 조건문과 반복문
- 이벤트 핸들링
- 컴포넌트
- 스토어
- Todo 예제만들기

### 섹션 2. 라이프사이클
- 기본 개념
- onMount, onDestroy
- beforeUpdate, afterUpdate


# svelte app

This is a project template for [Svelte](https://svelte.dev) apps. It lives at https://github.com/sveltejs/template.

To create a new project based on this template using [degit](https://github.com/Rich-Harris/degit):

```bash
npx degit sveltejs/template svelte-app
cd svelte-app
```

*Note that you will need to have [Node.js](https://nodejs.org) installed.*


## Get started

Install the dependencies...

```bash
cd svelte-app
npm install
```

...then start [Rollup](https://rollupjs.org):

```bash
npm run dev
```

Navigate to [localhost:8080](http://localhost:8080). You should see your app running. Edit a component file in `src`, save it, and reload the page to see your changes.

By default, the server will only respond to requests from localhost. To allow connections from other computers, edit the `sirv` commands in package.json to include the option `--host 0.0.0.0`.

