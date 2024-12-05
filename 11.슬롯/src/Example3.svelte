<script>
  import Card from './Card.svelte'  
</script>

<Card>
  <div slot="age">85</div>
  <h2 slot="name">Heropy</h2>
  <!-- slot에 정의한 domain을 사용처에서 변수처럼 사용할 수 있음 -->
  <div slot="email" let:domain let:hello>dddd{domain} {hello}</div>
</Card>
<Card>
  <div slot="age">82</div>
  <h3 slot="name">aaaaa</h3>
  <div slot="email" let:domain>fff{domain}</div>
</Card>

<style>
  /* 컴포넌트안에 스타일이 들어가도 적용되지 않음. 사용처에서 정의해줘야함 */
  h3 {
    color: red;
  }
</style>