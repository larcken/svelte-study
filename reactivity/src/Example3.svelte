<script>
  import {tick} from 'svelte'
  let count = 0;
  let double = 0;

  // svelte 에서는 label 구문을 사용하되, $ 사인을 써야한다.
  // 반응성을 가지게 되며 값을 할당하게 된다.
  $: {
    double = count*2
    console.log('double!')
  }

  // 변수 선언없이 이런식으로 사용할 수 있다.
  //$: double = count * 2

  async function assign() {
    count += 1;
    console.time('timer')
    // $: double = count * 2 가 수행되기 전에 log가 찍히기 때문에 console log에는 연산 전의 값이 찍힌다.
    // console.log(double)
    //  그래서 tick을 사용하게 된다.

    // tick을 사용하게 되면 $: double = count * 2 이 연산 될때까지 기다려주게 되어 화면에 출력된 값과 동일하게 출력하게 된다.
    await tick();
    console.timeEnd('timer')
    console.log(double)
  }
</script>

<button on:click={assign}>Assign</button>
<h2>count : {count}</h2>
<h2>double : {double}</h2>
