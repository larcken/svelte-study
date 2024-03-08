<script>
  
    let fruits = ['Apple', 'Banana', 'Cherry', 'Orange']

    let fruits2 = [
        {id: '1', name: 'Apple'},
        {id: '2', name: 'Banana'},
        {id: '3', name: 'Cherry'},
        {id: '4', name: 'Orange'}
    ]

    function deleteFirst() {
        fruits = fruits.slice(1)
        fruits2 = fruits2.slice(1)
    }

</script>

<button on:click={deleteFirst}>
    Delete first fruit!!
</button>

<br/>
1. 일반 배열
<ul>
    <!-- 전체 ul li 태그가 갱신되어 불필요하게 리소스가 낭비되는 경향이 있다. -->
    <!-- 그래서 키를 줘서 삭제되는 부분만 제거될 수 있도록 하면 개선이 된다. -->
    <!-- (fruit) 를 추가하면 키가 되어 고유성을 가지게 된다. -->
    <!-- 각각의 키가 세팅 될 수 있도록 코드를 작성하는것이 좋다. -->
    <!-- 키는 고유의 값이 될 수 있는 id 와 같은 값으로 세팅하는것이 좋다. -->
    {#each fruits as fruit (fruit)}
        <li>{fruit}</li>
    {/each}
</ul>

2. 객체로 id를 세팅하여 키를 세팅하는 방법
<ul>
    {#each fruits2 as fruit (fruit.id)}
        <li>{fruit.name}</li>
    {/each}
</ul>
