<script>
  import {onMount} from 'svelte'
  import Heropy from "./Heropy.svelte";
  import Footer from './Footer.svelte';

  let heropy

  onMount(() => {
    console.log(heropy)
    // title은 Heropy 컴포넌트의 title 속성. 직접 접근은 막고 있음
    // <svelte:options accessors/> 을 통해서 접근하도록 되어있음
    console.log(heropy.title)
  })

</script>
<!-- svelte는 vue와 같은 다른 프레임워크랑 다른게 최상위 엘리멘트를 선언하는 형태가 아니기 때문에 프로퍼티를 다른 엘리멘트와 동일한 이름으로 사용해도 무방하다. -->
<!-- 양방향 데이터 바인딩을 하기 위해 bind:this를 사용.  -->
<Heropy title="aaa" bind:this={heropy} />
<Footer />

