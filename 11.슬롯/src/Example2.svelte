<script>
  import Card from './Card.svelte'  
</script>

<Card>
  <div slot="age">85</div>
  <h2 slot="name">Heropy</h2>
  <div slot="email">dddd@aaaa.cccc</div>
</Card>
<Card>
  <div slot="age">82</div>
  <h3 slot="name">aaaaa</h3>
  <div slot="email">ccc@aaaa.cccc</div>
</Card>


<style>
  /* 컴포넌트안에 스타일이 들어가도 적용되지 않음. 사용처에서 정의해줘야함 */
  h3 {
    color: red;
  }
</style>