<template>
  <el-container class="chat-container">
    <!-- 侧边栏：聊天列表 -->
    <el-aside width="260px" class="chat-sidebar">
      <div class="sidebar-header">
        <el-button
          type="primary"
          icon="el-icon-plus"
          @click="createNewChat"
          style="width: 100%"
        >新聊天</el-button
        >
      </div>
      <el-scrollbar class="chat-list-scrollbar">
        <div
          v-for="chat in chatList"
          :key="chat.id"
          class="chat-list-item"
          :class="{ active: chat.id === currentChatId }"
          @click="selectChat(chat.id)"
        >
          <div class="chat-item-content">
            <i class="el-icon-chat-dot-round"></i>
            <span class="chat-item-name">{{ chat.name }}</span>
          </div>
          <el-popover placement="right" width="100" trigger="hover">
            <div class="action-buttons">
              <el-button
                type="text"
                size="mini"
                @click.stop="renameChat(chat)"
              >重命名</el-button
              >
              <el-button
                type="text"
                size="mini"
                class="delete-btn"
                @click.stop="deleteChat(chat.id)"
              >删除</el-button
              >
            </div>
            <i class="el-icon-more" slot="reference"></i>
          </el-popover>
        </div>
        <el-empty v-if="!chatList.length" description="暂无聊天记录"></el-empty>
      </el-scrollbar>
    </el-aside>

    <!-- 主聊天区域 -->
    <el-container>
      <!-- 顶部工具栏 -->
      <el-header class="chat-header">
        <div class="header-model-selector">
          <el-select v-model="selectedAiProvider" placeholder="选择AI模型">
            <el-option value="ollama" label="deepseek-r1:1.5b"></el-option>
            <el-option value="openai" label="gpt-4o"></el-option>
          </el-select>
          <el-select v-model="selectedRagTag" clearable placeholder="选择知识库">
            <el-option
              v-for="tag in ragTags"
              :key="tag"
              :label="`Rag: ${tag}`"
              :value="tag"
            ></el-option>
          </el-select>
        </div>
        <el-button
          icon="el-icon-upload"
          @click="uploadDialogVisible = true"
        >上传知识</el-button
        >
      </el-header>

      <!-- 消息显示区 -->
      <el-main class="chat-main">
        <el-scrollbar ref="scrollbar" class="message-scrollbar">
          <div class="message-list">
            <div v-if="!currentChat || !currentChat.messages.length" class="welcome-message">
              <div class="logo">🐏</div>
              <h2>开始新的对话吧！</h2>
              <p>Ollama 正在运行</p>
            </div>
            <div
              v-for="(msg, index) in currentChat.messages"
              :key="index"
              class="message-item"
              :class="{ 'is-assistant': msg.isAssistant }"
            >
              <div class="message-bubble">
                <div class="markdown-body" v-html="renderMarkdown(msg.content)"></div>
              </div>
            </div>
          </div>
        </el-scrollbar>
      </el-main>

      <!-- 输入区 -->
      <el-footer class="chat-footer" height="120px">
        <el-input
          type="textarea"
          :rows="4"
          placeholder="输入一条消息... (Shift + Enter 换行)"
          v-model="messageInput"
          @keydown.enter.native="handleKeydown"
        ></el-input>
        <el-button
          type="primary"
          class="send-btn"
          @click="sendMessage"
          :disabled="isStreaming"
        >{{ isStreaming ? '正在生成...' : '发送' }}</el-button
        >
      </el-footer>
    </el-container>

    <!-- 统一上传对话框 -->
    <UploadDialog
      :visible.sync="uploadDialogVisible"
      @upload-success="handleUploadSuccess"
    />
  </el-container>
</template>

<script>
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import axios from 'axios';
import UploadDialog from './upload.vue'; // 引入下一个组件

export default {
  name: 'ChatView',
  components: { UploadDialog },
  data() {
    return {
      chatList: [],
      currentChatId: null,
      messageInput: '',
      isStreaming: false,
      currentEventSource: null,

      // 模型和知识库选项
      selectedAiProvider: 'ollama',
      aiModels: {
        ollama: 'deepseek-r1:1.5b',
        openai: 'gpt-4o',
      },
      selectedRagTag: '',
      ragTags: [],

      // 上传对话框可见性
      uploadDialogVisible: false,
    };
  },
  computed: {
    currentChat() {
      return this.chatList.find(c => c.id === this.currentChatId) || null;
    },
  },
  methods: {
    // --- 聊天管理 ---
    loadChats() {
      const chats = Object.keys(localStorage)
        .filter(key => key.startsWith('chat_'))
        .map(key => JSON.parse(localStorage.getItem(key)))
        .sort((a, b) => b.id - a.id); // 按时间倒序
      this.chatList = chats;

      const savedChatId = localStorage.getItem('currentChatId');
      if (savedChatId && this.chatList.some(c => c.id == savedChatId)) {
        this.currentChatId = parseInt(savedChatId, 10);
      } else if (this.chatList.length > 0) {
        this.currentChatId = this.chatList[0].id;
      } else {
        this.createNewChat();
      }
    },
    saveChat(chat) {
      localStorage.setItem(`chat_${chat.id}`, JSON.stringify(chat));
    },
    createNewChat() {
      const newChat = {
        id: Date.now(),
        name: '新聊天',
        messages: [],
      };
      this.chatList.unshift(newChat);
      this.selectChat(newChat.id);
    },
    selectChat(chatId) {
      this.currentChatId = chatId;
      localStorage.setItem('currentChatId', chatId);
      this.scrollToBottom();
    },
    renameChat(chat) {
      this.$prompt('请输入新的聊天名称', '重命名', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputValue: chat.name,
      }).then(({ value }) => {
        if (value && value.trim()) {
          chat.name = value.trim();
          this.saveChat(chat);
          this.$message.success('重命名成功');
        }
      }).catch(() => {});
    },
    deleteChat(chatId) {
      this.$confirm('此操作将永久删除该聊天记录, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        this.chatList = this.chatList.filter(c => c.id !== chatId);
        localStorage.removeItem(`chat_${chatId}`);
        if (this.currentChatId === chatId) {
          if (this.chatList.length > 0) {
            this.selectChat(this.chatList[0].id);
          } else {
            this.createNewChat();
          }
        }
        this.$message.success('删除成功!');
      }).catch(() => {});
    },

    // --- 核心对话功能 ---
    handleKeydown(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    },
    sendMessage() {
      const message = this.messageInput.trim();
      if (!message || this.isStreaming) return;

      if (!this.currentChatId) {
        this.createNewChat();
      }

      this.currentChat.messages.push({ content: message, isAssistant: false });
      this.saveChat(this.currentChat);
      this.messageInput = '';
      this.scrollToBottom();

      this.startEventStream(message);
    },
    startEventStream(message) {
      if (this.currentEventSource) {
        this.currentEventSource.close();
      }
      this.isStreaming = true;
      this.isStreamFinished = false; // <-- 新增：每次开始新流时重置标志

      const assistantMessage = { content: '', isAssistant: true };
      this.currentChat.messages.push(assistantMessage);
      this.scrollToBottom();

      const aiModel = this.aiModels[this.selectedAiProvider];
      let url;
      if (this.selectedRagTag) {
        url = `http://localhost:8090/api/v1/${this.selectedAiProvider}/generate_stream_rag?message=${encodeURIComponent(message)}&ragTag=${encodeURIComponent(this.selectedRagTag)}&model=${encodeURIComponent(aiModel)}`;
      } else {
        url = `http://localhost:8090/api/v1/${this.selectedAiProvider}/generate_stream?message=${encodeURIComponent(message)}&model=${encodeURIComponent(aiModel)}`;
      }

      this.currentEventSource = new EventSource(url);

      this.currentEventSource.onmessage = event => {
        try {
          const data = JSON.parse(event.data);
          if (data.result && data.result.output && data.result.output.content) {
            assistantMessage.content += data.result.output.content;
            this.scrollToBottom();
          }

          // --- 关键修改点 ---
          if (data.result && data.result.output && data.result.output.properties && data.result.output.properties.finishReason === 'STOP') {
            this.isStreamFinished = true; // <-- 修改：标记流已正常结束
            this.currentEventSource.close();
            this.isStreaming = false;
            this.saveChat(this.currentChat);
          }
        } catch (e) {
          console.error('Error parsing event data:', e);
        }
      };

      this.currentEventSource.onerror = () => {
        // --- 关键修改点 ---
        if (this.isStreamFinished) {
          // 如果是正常结束，则直接返回，不执行任何错误处理
          return;
        }

        // assistantMessage.content += '\n\n[发生错误，连接已中断]';
        this.currentEventSource.close();
        this.isStreaming = false;
        this.saveChat(this.currentChat);
        // this.$message.error('与服务器的连接发生错误');
      };
    },

    // --- 辅助功能 ---
    async fetchRagTags() {
      try {
        const response = await axios.get('http://localhost:8090/api/v1/rag/query_rag_tag_list');
        if (response.data.code === '0000' && response.data.data) {
          this.ragTags = response.data.data;
        }
      } catch (error) {
        console.error('获取知识库列表失败:', error);
        this.$message.error('获取知识库列表失败');
      }
    },
    renderMarkdown(content) {
      if (!content) return '';
      // 配置marked以使用gfm (GitHub Flavored Markdown)
      marked.setOptions({
        gfm: true,
        breaks: true,
      });
      return DOMPurify.sanitize(marked.parse(content));
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const scrollbar = this.$refs.scrollbar;
        if (scrollbar && scrollbar.wrap) {
          scrollbar.wrap.scrollTop = scrollbar.wrap.scrollHeight;
        }
      });
    },
    handleUploadSuccess() {
      this.$message.success('知识库更新成功！');
      this.fetchRagTags();
    },
  },
  mounted() {
    this.loadChats();
    this.fetchRagTags();
  },
  beforeDestroy() {
    if (this.currentEventSource) {
      this.currentEventSource.close();
    }
  },
};
</script>

<style scoped>
.chat-container {
  height: calc(100vh - 80px);
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', Arial, sans-serif;
}

/* Sidebar */
.chat-sidebar {
  background-color: #f5f7fa;
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
}
.sidebar-header {
  padding: 15px;
  border-bottom: 1px solid #e4e7ed;
}
.chat-list-scrollbar {
  flex-grow: 1;
}
.chat-list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 15px;
  cursor: pointer;
  transition: background-color 0.2s;
}
.chat-list-item:hover {
  background-color: #ecf5ff;
}
.chat-list-item.active {
  background-color: #d9ecff;
  font-weight: bold;
}
.chat-item-content {
  display: flex;
  align-items: center;
  overflow: hidden;
}
.chat-item-name {
  margin-left: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.el-icon-more {
  padding: 5px;
  border-radius: 50%;
}
.el-icon-more:hover {
  background-color: #dcdfe6;
}
.action-buttons .delete-btn {
  color: #f56c6c;
}
.action-buttons .delete-btn:hover {
  color: #f78989;
}


/* Header */
.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e4e7ed;
}
.header-model-selector {
  display: flex;
  gap: 15px;
}

/* Main Chat Area */
.chat-main {
  padding: 0;
  background-color: #e9eef3;
}
.message-scrollbar {
  height: 100%;
}
.message-list {
  padding: 20px;
}
.welcome-message {
  text-align: center;
  padding-top: 15vh;
  color: #909399;
}
.welcome-message .logo {
  font-size: 60px;
  margin-bottom: 20px;
}

.message-item {
  display: flex;
  margin-bottom: 20px;
}
.message-item .message-bubble {
  max-width: 70%;
  padding: 10px 15px;
  border-radius: 12px;
  background-color: #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  word-wrap: break-word;
}
.message-item.is-assistant {
  justify-content: flex-start;
}
.message-item:not(.is-assistant) {
  justify-content: flex-end;
}
.message-item:not(.is-assistant) .message-bubble {
  background-color: #d9ecff;
}

/* Markdown Styles */
.markdown-body {
  font-size: 15px;
  line-height: 1.7;
}
/* This is important to ensure pre-wrap works inside Element UI components */
.markdown-body >>> pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  background-color: #f4f4f5;
  color: #606266;
  padding: 1em;
  border-radius: 4px;
}
.markdown-body >>> code {
  background-color: #f4f4f5;
  padding: 0.2em 0.4em;
  margin: 0;
  font-size: 85%;
  border-radius: 3px;
}
.markdown-body >>> pre > code {
  padding: 0;
  background-color: transparent;
}
.markdown-body >>> p {
  margin: 0;
}
.markdown-body >>> p:not(:last-child) {
  margin-bottom: 1em;
}


/* Footer */
.chat-footer {
  padding: 15px 20px;
  border-top: 1px solid #e4e7ed;
  position: relative;
}
.send-btn {
  position: absolute;
  bottom: 25px;
  right: 30px;
}
</style>
