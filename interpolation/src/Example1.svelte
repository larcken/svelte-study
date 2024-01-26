<script>
  let href = 'https://www.naver.com'
  let name = 'Naver'
  let value = 'Now input value!'
  let isUpperCase = false
</script>

<!-- 3.1 내용/속성/표현식 보간 -->

<!-- <a href="https://google.com">Google</a> -->
<!-- 보간법으로 작성 {}형태로 변수 작성 -->
<!-- 속성과 변수명이 같으면 속성은 생략 가능 -->
<a {href}>{name}</a>

<!-- <input type="text" value="Default value..." /> -->
<input {value} on:input={e => value = e.target.value} />
<!-- <input bind:value={value} /> -->
<!-- 양방향 바인딩때에는 value쪽을 생략 -->
<input bind:value />

<!-- svelte 는 보간법을 권장한다. 컴파일러기때문에 화면을 출력하기 전 최적화를 진행한다. -->
<div>{isUpperCase ? 'DIV' : 'div'}</div>
