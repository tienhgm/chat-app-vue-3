<script setup lang="ts">
import { onMounted, ref } from "vue";
import socket from "./plugins/socket";
const username = ref("");
const isLoggedIn = ref<boolean>(false);
const users = ref<any>([]);
function onSubmitLogin() {
  isLoggedIn.value = true;
  socket.auth = { username: username.value };
  socket.connect();
}
onMounted(() => {
  socket.on("getUsers", (data: any) => {
    data.forEach((user: any) => {
      user.self = user.userId === socket.id;
    });
    console.log(data);
    users.value = data.sort((a: any, b: any) => {
      if (a.self) return -1;
      if (b.self) return 1;
      if (a.username < b.username) return -1;
      return a.username > b.username ? 1 : 0;
    });
  });
  socket.on("userJustConnected", (data: any) => {
    users.value.push(data);
  });
});
</script>

<template>
  <form
    @submit.prevent="onSubmitLogin"
    class="flex justify-center mt-[3rem]"
    v-if="!isLoggedIn"
  >
    <input type="text" v-model="username" placeholder="username" />
    <button type="submit">Login</button>
    <!-- <button @click="onConnectSocket">On connect socket</button> -->
  </form>
  <div class="grid grid-cols-12 gap-4 mt-[3rem]" v-else>
    <div class="col-span-3">
      <div class="text-xl font-bold">List user friend</div>
      <ul>
        <li v-for="user in users" :key="user.userId" class="flex items-center gap-1">
          <span>{{ user.username }}</span>
          <span class="inline-block w-1 h-1 rounded-full bg-green-500"></span>
        </li>
      </ul>
    </div>
    <div class="col-span-9">Chat workspace</div>
  </div>
</template>

<style scoped></style>
