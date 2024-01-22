<script>
    import {onMount, onDestroy, beforeUpdate, afterUpdate} from 'svelte'

    let name = "Something..";
    let h1;

    function moreDot() {
        name += ".";
    }

    // 컴포넌트가 연결될때도 실행됨
    // 반응성이 있는 데이터가 실행되면 실행됨
    // 화면이 바뀌기전 실행
    beforeUpdate(() => {
        console.log('before update');
        // 최초 로딩 시 h1 이 없을 경우가 존재하기 때문에 존재하면 수행될 수 있도록 작성할 필요가 있다.
        console.log(h1 && h1.innerText)

        // 반응성이 있는 데이터를 작성하게 된다면 무한루프에 빠질 수 있다.
    })

    // 화면이 바뀐 후 실행
    afterUpdate(() => {
        console.log('after update');
        console.log(h1.innerText)

        // 반응성이 있는 데이터를 작성하게 된다면 무한루프에 빠질 수 있다.
    })

    onMount(() => {
        console.log('Mounted!');
        h1 = document.querySelector('h1');

        // destroy 와 같은 역할 (onDestroy 보다 먼저 동작하긴 함)
        // async (비동기) 로 설정하게되면 해당 부분은 동작하지 않음 (promise가 반환되게 되어 있음)
        // return () => {
        //     console.log('Destroy in mount')
        // }
    })

    onDestroy(() => {
        // const h1 = document.querySelector('h1');
        // console.log(h1.innerText);
        console.log('before destroy');
    })
</script>

<h1 on:click={moreDot}>{name}</h1>