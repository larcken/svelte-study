<script>
  import User from './User.svelte'

  let users = [
    {
      name: 'Neo',
      age: 20,
      email: 'neo@abc.com'
    },
    {
      name: 'Levis',
      age: 25,
      email: 'levis@abc.com'
    },
    {
      name: 'Evan',
      age: 30
    }
  ]

</script>


<section>
  {#each users as user}
    <User
      name={user.name}
      age={user.age}
      email={user.email}
    />
  {/each}
</section>

<!-- props 이름과 데이터의 이름이 같으면 props 이름은 생략이 가능 -->
<section>
  {#each users as {name, age, email}}
    <User {name} {age} {email} />
  {/each}
</section>

<!-- 전개연산자로 바인딩. 단일 연산자의 데이터가 props가 전달됨 -->
<section>
  {#each users as user}
    <User {...user} />
  {/each}
</section>


<style>
  
</style>