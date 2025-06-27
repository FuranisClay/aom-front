<template>
  <el-dialog
    title="上传知识"
    :visible.sync="dialogVisible"
    width="500px"
    :before-close="handleClose"
    :close-on-click-modal="false"
  >
    <el-tabs v-model="activeTab">
      <!-- 文件上传 -->
      <el-tab-pane label="📁 上传文件" name="file">
        <el-form :model="fileForm" ref="fileForm" label-width="80px">
          <el-form-item label="知识标题" prop="title" required>
            <el-input
              v-model="fileForm.title"
              placeholder="为这批文件设置一个知识标签"
            ></el-input>
          </el-form-item>
          <el-form-item label="选择文件" prop="files" required>
            <el-upload
              ref="fileUploader"
              action="#"
              :http-request="handleFileRequest"
              :on-remove="handleFileRemove"
              :file-list="fileForm.fileList"
              :auto-upload="false"
              multiple
            >
              <el-button slot="trigger" size="small" type="primary"
              >选取文件</el-button
              >
              <div slot="tip" class="el-upload__tip">
                支持 .pdf, .csv, .txt, .md, .sql, .java 等文件
              </div>
            </el-upload>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <!-- Git仓库解析 -->
      <el-tab-pane label="⎇ 解析仓库" name="git">
        <el-form :model="gitForm" ref="gitForm" label-width="80px">
          <el-form-item label="仓库地址" prop="repoUrl" required>
            <el-input
              v-model="gitForm.repoUrl"
              placeholder="https://github.com/user/repo.git"
            ></el-input>
          </el-form-item>
          <el-form-item label="用户名" prop="userName" required>
            <el-input
              v-model="gitForm.userName"
              placeholder="Git用户名"
            ></el-input>
          </el-form-item>
          <el-form-item label="Token" prop="token" required>
            <el-input
              v-model="gitForm.token"
              type="password"
              show-password
              placeholder="请输入密码或Personal Access Token"
            ></el-input>
          </el-form-item>
        </el-form>
      </el-tab-pane>
    </el-tabs>

    <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取 消</el-button>
      <el-button
        type="primary"
        @click="handleSubmit"
        :loading="isLoading"
      >{{ isLoading ? '提交中...' : '确 定' }}</el-button
      >
    </span>
  </el-dialog>
</template>

<script>
import axios from 'axios';

export default {
  name: 'UploadDialog',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      activeTab: 'file',
      isLoading: false,
      fileForm: {
        title: '',
        fileList: [], // 用于el-upload显示
        filesToUpload: [], // 存储真实File对象
      },
      gitForm: {
        repoUrl: '',
        userName: '',
        token: '',
      },
    };
  },
  computed: {
    dialogVisible: {
      get() {
        return this.visible;
      },
      set(val) {
        this.$emit('update:visible', val);
      },
    },
  },
  methods: {
    handleClose() {
      // 重置所有表单
      this.$refs.fileForm.resetFields();
      this.$refs.gitForm.resetFields();
      this.$refs.fileUploader.clearFiles();
      this.fileForm.filesToUpload = [];
      this.dialogVisible = false;
    },
    handleSubmit() {
      if (this.activeTab === 'file') {
        this.submitFiles();
      } else {
        this.submitGit();
      }
    },
    // --- 文件上传逻辑 ---
    handleFileRequest(options) {
      // el-upload的自定义请求会把File对象放在这里
      this.fileForm.filesToUpload.push(options.file);
    },
    handleFileRemove(file, fileList) {
      // 从待上传列表中移除
      this.fileForm.filesToUpload = this.fileForm.filesToUpload.filter(f => f.uid !== file.uid);
    },
    async submitFiles() {
      this.$refs.fileUploader.submit(); // 这会触发handleFileRequest

      if (!this.fileForm.title.trim()) {
        return this.$message.error('请输入知识标题');
      }
      if (this.fileForm.filesToUpload.length === 0) {
        return this.$message.error('请至少选择一个文件');
      }

      this.isLoading = true;
      const formData = new FormData();
      formData.append('ragTag', this.fileForm.title);
      this.fileForm.filesToUpload.forEach(file => {
        formData.append('file', file);
      });

      try {
        const response = await axios.post('http://localhost:8090/api/v1/rag/file/upload', formData);
        if (response.data.code === '0000') {
          this.$message.success('文件上传成功！');
          this.$emit('upload-success');
          this.handleClose();
        } else {
          throw new Error(response.data.info || '上传失败');
        }
      } catch (error) {
        this.$message.error(error.message || '上传过程中发生错误');
      } finally {
        this.isLoading = false;
      }
    },

    // --- Git仓库解析逻辑 ---
    async submitGit() {
      this.$refs.gitForm.validate(async (valid) => {
        if (valid) {
          this.isLoading = true;
          try {
            const params = new URLSearchParams();
            params.append('repoUrl', this.gitForm.repoUrl);
            params.append('userName', this.gitForm.userName);
            params.append('token', this.gitForm.token);

            const response = await axios.post('http://localhost:8090/api/v1/rag/analyze_git_repository', params);

            if (response.data.code === '0000') {
              this.$message.success('Git仓库解析任务提交成功！');
              this.$emit('upload-success');
              this.handleClose();
            } else {
              throw new Error(response.data.info || '解析失败');
            }
          } catch (error) {
            this.$message.error(error.message || '提交解析任务时出错');
          } finally {
            this.isLoading = false;
          }
        }
      });
    },
  },
};
</script>

<style scoped>
.el-upload__tip {
  line-height: 1.2;
}
</style>
