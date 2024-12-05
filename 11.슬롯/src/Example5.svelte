<script>
  import UserCard from "./UserCard.svelte"; 
</script>

<UserCard>
  <h2 slot="name">HEROPY</h2>
  <h3 slot="age">11</h3>
  <h3 slot="email">aaa@aaa.ccc</h3>
</UserCard>


<UserCard>
  <h2 slot="name">NEO</h2>
  <h3 slot="email">neo@aaa.ccc</h3>
</UserCard>

<UserCard>
  <h2 slot="name">Evan</h2>
</UserCard>