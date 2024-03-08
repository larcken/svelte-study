<script>
    let fruits= [
        {id: '1', name: 'Apple'},
        {id: '2', name: 'Banana'},
        {id: '3', name: 'Cherry'},
        {id: '4', name: 'Apple'},
        {id: '5', name: 'Orange'}
    ]
    let todos = []
    let fruits2D = [
        [1, 'Apple'],
        [2, 'Banana'],
        [3, 'Cherry'],
        [4, 'Orange']
    ]
    let user = {
        name: 'amps',
        age: 100,
        email: 'test@gmail.com'
    }
</script>

<section>
    <h2>기본</h2>
    <!-- {#each 배열 as 속성} {/each} -->
    {#each fruits as fruit}
        <div>{fruit.name}</div>
    {/each}
</section>

<section>
    <h2>순서 (index)</h2>
    <!-- {#each 배열 as 속성, 순서} {/each} -->
    {#each fruits as fruit, index}
        <div>{index} / {fruit.name}</div>
    {/each}
</section>

<section>
    <h2>아이템 고유화(key)</h2>
    <!-- {#each 배열 as 속성, 순서 (키)} {/each} -->
    {#each fruits as fruit, index (fruit.id)}
        <div>{index} / {fruit.name}</div>
    {/each}
</section>

<section>
    <h2>빈 배열 처리(else)</h2>
    <!-- 값이 비어있는 배열인지 체크해서 분기로 처리할 수 있다. -->
    <!-- {#each} {:else} {/each} -->
    {#each todos as todo (todo.id)}
        <div>{todo.name}</div>
    {:else}
        <div>아이템이 없어요!</div>
    {/each}
</section>

<section>
    <h2>구조 분해 (destructuring)</h2>
    <!-- 자바스크립트의 구조분해, {id, name} 형태로 json 내에 있는 변수를 끄집어내서 사용할 수 있음 -->
    <!-- {#each 배열 as {id, name}} {/each} -->
    {#each fruits as {id, name} (id)}
        <div>{name}</div>
    {/each}
</section>

<section>
    <h2>2차원 배열</h2>
    <!-- 배열도 구조분해 형태로 사용할 수 있다. -->
    <!-- {#each 배열 as [id, name]} {/each} -->
    {#each fruits2D as [id, name] (id)}
        <div>{name}</div>
    {/each}
</section>

<section>
    <h2>나머지 연산자 (rest)</h2>
    <!-- {#each 배열 as {id, ...rest}} {/each} -->
    <!-- name 외 다른 항목이 있는 경우 나머지 모두 가져와서 rest 변수로 사용하겠다라는 의미 -->
    {#each fruits as {id, ...rest} (id)}
        <div>{rest.name}</div>
    {/each}
</section>

<section>
    <h2>객체 데이터</h2>
    <!-- 객체 데이터는 반복가능하지 않지만 Object.entries를 이용해서 객체의 값을 모두 가져올 수 있다. -->
    {#each Object.entries(user) as [key, value] (key)}
        <div>{key}: {value}</div>
    {/each}
</section>

<style>
    section {
        border: 1px solid salmon;
        margin: 15px;
        padding: 10px;
    }   
</style>