<script>
  let h1 = '<h1>Hello Example</h1>'
  let xss = '<iframe onload="conosle.log(`ddd`)"></iframe>'
  // ${document.cookie}
  // 기본적으로 xss 공격에 대한 필터링을 하고 사용하는것이 좋다.
  // let xss = '<iframe onload="document.location=`https://www.naver.com`"></iframe>'
</script>

<!-- 3.2 원시 HTML, 데이터 디버깅 -->
<!-- @html 키워드를 추가해주면 html 렌더링을 한다. -->
{@html h1}
{@html xss}
