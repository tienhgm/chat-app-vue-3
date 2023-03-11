<script setup lang="ts">
import { onMounted, ref } from "vue";
import socket from "./plugins/socket";
const username = ref("");
const isLoggedIn = ref<boolean>(false);
const users = ref<any>([]);
const message = ref<any>("");
const selectedUserToSend = ref();
function onSubmitLogin() {
  isLoggedIn.value = true;
  socket.auth = { username: username.value };
  socket.connect();
}
const onSelectedUser = (user: any) => {
  selectedUserToSend.value = user;
};
const onSendMessage = () => {
  socket.emit("privateMessage", {
    message: message.value,
    to: selectedUserToSend.value.userId,
  });
  if (!selectedUserToSend.value.messages) {
    selectedUserToSend.value.messages = [];
  }
  selectedUserToSend.value?.messages.push({
    message: message.value,
    isSelf: true,
  });
  message.value = "";
};
onMounted(() => {
  socket.on("getUsers", (data: any) => {
    data.forEach((user: any) => {
      user.self = user.userId === socket.id;
    });
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
  socket.on("privateMessageToReceiver", ({ message, from }) => {
    for (let i = 0; i < users.value.length; i++) {
      const user = users.value[i];
      if (user.userId === from) {
        user.messages.push({
          message,
          isSelf: false,
        });
      }
    }
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
    <button type="submit" class="border-2 border-indigo-500/100">Login</button>
    <!-- <button @click="onConnectSocket">On connect socket</button> -->
  </form>
  <div class="grid grid-cols-12 gap-4 mt-[3rem]" v-else>
    <div class="col-span-3">
      <div class="text-xl font-bold">List user friend</div>
      <ul>
        <li v-for="user in users" :key="user.userId">
          <button @click="onSelectedUser(user)" class="flex items-center gap-1">
            <span>{{ user.username }}</span>
            <span class="inline-block w-1 h-1 rounded-full bg-green-500"></span>
          </button>
        </li>
      </ul>
    </div>
    <div class="col-span-9">
      <div class="text-xl font-bold">Chat workspace</div>
      <div class="flex items-center gap-1" v-if="selectedUserToSend">
        <span class="inline-block w-1 h-1 rounded-full bg-green-500"></span>
        <span>{{ selectedUserToSend.username }}</span>
      </div>
      <div class="flex flex-col" v-if="selectedUserToSend">
        <div
          class="flex"
          v-for="(message, idx) in selectedUserToSend.messages"
          :key="idx"
        >
          <div>
            <b
              >{{
                message.isSelf ? "You" : selectedUserToSend.username
              }}:&nbsp;</b
            >
          </div>
          <div>{{ message.message }}</div>
        </div>
      </div>
      <div class="flex" v-if="selectedUserToSend">
        <form @submit.prevent="onSendMessage" class="flex gap-2">
          <input
            type="text"
            v-model="message"
            placeholder="Your message ..."
            class="border-2 border-indigo-500/100 rounded-md"
          />
          <button
            type="submit"
            class="border-2 border-indigo-500/100 rounded-md"
          >
            Send Message
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
