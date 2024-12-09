<script>
  function hello(node, color) {
    // use로 명시된 element를 사용할 수 있다.
    console.log(node)
    node.style.width = '100px'
    node.style.height = '100px'
    node.style.backgroundColor = color || 'tomato'
  }


  let toggle = true
  let width = 200

  function hello2(node, options = {}) {
    console.log(node)
    // 디폴트 값을 설정할 수 있음
    const {width = '100px', height = '100px', color = 'tomato'} = options
    node.style.width = options.width
    node.style.height = options.height
    node.style.backgroundColor = options.color

    
    return {
      // use로 연결되어 있는 element의 매개변수가 수정될때 실행된다.
      update: (opts) => {
        console.log('update!', opts)
        node.style.width = opts.width
      },
      // use로 연결되어 있는 element가 삭제될때 실행된다.
      destroy: () => {
        console.log('destroy!')
      }
    }
  }
</script>

<button on:click={() => toggle = !toggle}>
  Toggle!
</button>
<button on:click={() => width += 20}>
  Size Up!
</button>

<div use:hello></div>
<div use:hello={'royalblue'}></div>

{#if toggle}
  <div use:hello2={{
    width: `${width}px`,
    height: '70px',
    color: 'red'
  }}></div>
{/if}
