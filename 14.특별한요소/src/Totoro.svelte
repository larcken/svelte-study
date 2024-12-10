<!-- 컴포넌트가 추가될때 해당 head가 추가된다. -->
<!-- 런타임에서 추가하려면 /public/폴더 하위에 파일을 생성해줘야 함 -->
 <!-- document.head -->
<svelte:head>
  <link rel="stylesheet" href="./main.css" />
</svelte:head>

<!-- 빈태그 형식으로 만들어줘야함 -->
 <!-- document.body -->
<svelte:body on:mouseover={e => console.log(e.clientX, e.clientY)} />

<h1>Totoro</h1>