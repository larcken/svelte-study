<script>
  let count = 0;

  // 선언
  $: double = count * 2;

  // 블록
  $: {
    console.log(count);
    console.log(double);
  }

  // 함수 실행
  // 데이터가 변경되면 함수가 실행하려면 이렇게 작성
  // 변경을 감지할 데이터, 실행될 함수
  $: count, log();

  // 즉시 실행 함수 (IIFE)
  $: count, (() => {
    console.log("life : example");
  })();

  // 조건문 (if)
  $: if(count > 0) {
    console.log('if:', double);
  }

  // 반복문 (for)
  $: for (let i= 0; i< 3; i+=1) {
    count
    console.log('for:', i)
  }

  // 조건문 (switch)
  $: switch (count) {
    case 1:
      console.log('switch : 1')
      break;
    default:
      console.log('swtich: default');
  }

  // 유효범위
  $: {
    function scope1() {
      console.log('scope1')
      function scope2() {
        console.log('scope2')
        function scope3() {
          console.log('scope3', count)
        }
        scope3()
      }
      scope2()
    }
    scope1()
  }
  

  function log() {
    console.log("fn: Example");
  }
  function assign() {
    count += 1;
  }
</script>

<button on:click={assign}>Assign!</button>
