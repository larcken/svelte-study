<script>
  let name = 'Example';
  let fruits = ['Apple', 'Banana', 'Cherry']

  let user = {
    name : 'username',
    depth: {
      a: 'b'
    },
    numbers: [1,2]
  }

  let numbers = user.numbers;
  let hello = "world"

  function assign() {
    name = 'Neo';
    // 할당연산자(=)를 사용하는 데이터 갱신을 통해서만 반응성을 가질 수 있어 array push에서는 반응성을 가질 수 없다.
    fruits.push('Orange');
    // 그래서 이렇게 할당을 다시 해줘야한다. svelte 에서 자주 사용될 수 있는 코드
    fruits = fruits
    // 이렇게 전개 연산자를 사용해도 가능
    fruits = [...fruits, 'Test']

    user.name = 'Neo'
    user.depth.a = 'c'
    // $$invalidate(2, user.name = "Neo", user)
    // $$invalidate(2, user.depth.a = "c", user)

    // 할당 연산자를 통해서 한것이 아니기 때문에 반응성을 가지지 않아야하는데 반응성을 가진다.
    // 이유는 user.name, user.depth 가 할당 연산자를 통해 갱신되면서 user가 갱신되어 user.nunmers도 반응성을 가지게 됨
    user.numbers.push(3)

    // 할당 연산자를 사용하면서 numbers 가 반응성을 가지게 된다.
    numbers = numbers;

    // svelte 는 다른 프레임워크와 다르게 할당 연산자를 통해 반응성을 갖도록 코드를 추가해야한다.
    // 코드로 불편함이 따르긴 하지만 runtime에서 동작하는 코드가 없어 최적화된 메모리로 동작할 수 있다.
  }
</script>

<button on:click={assign}>
  Assign!
</button>

<h2>{name}</h2>
<h2>fruits: {fruits}</h2>
<h2>user name: {user.name}</h2>
<h2>user depth a : {user.depth.a}</h2>
<h2>user numbers: {user.numbers}</h2>
<h2>numbers: {numbers}</h2>
<h2>{hello}</h2>