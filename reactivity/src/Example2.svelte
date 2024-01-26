<script>
  // Svelte 가 아닌, Javascript 문법 입니다.

  // javascript lable (lable:)
  loop1:
  for (let i = 1; i < 4; i += 1) {
    loop2:
    for (let k = 1; k < 4; k += 1) {
      if (i === 2) {
        // i가 2이면 loop1 구문이 멈추게 된다.
        break loop1;
      }
      console.log(`${i}-${k}`);
    }
    console.log("-----------");
  }

  example: {
    console.log('a');
    break example;
    console.log('b');
  }

  // 크게 유용하지 않지만 svelte 반응성 구문을 통해 더 알아보자..

  // Svelte 반응성 구문
  // javascript 에서 사용하는 Label을 svelte에서는 반응성 구문으로 활용한다.
  let count = 0;
  $: {
    console.log(count)
  }
    
</script>
