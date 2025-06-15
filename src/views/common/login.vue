<template>
  <div class="login-wrapper">
    <div class="login-card">
      <h2 class="login-title">登录</h2>
      <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()" status-icon>
        <el-form-item prop="userName">
          <el-input v-model="dataForm.userName" placeholder="帐号"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="dataForm.password" type="password" placeholder="密码"></el-input>
        </el-form-item>
        <el-form-item prop="captcha">
          <el-row :gutter="20">
            <el-col :span="14">
              <el-input v-model="dataForm.captcha" placeholder="验证码"></el-input>
            </el-col>
            <el-col :span="10">
              <img :src="captchaPath" @click="getCaptcha()" alt="验证码" class="captcha-img">
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="dataFormSubmit()" class="login-btn">登录</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import { getUUID } from '@/utils'

export default {
  data () {
    return {
      dataForm: {
        userName: '',
        password: '',
        uuid: '',
        captcha: ''
      },
      dataRule: {
        userName: [{ required: true, message: '帐号不能为空', trigger: 'blur' }],
        password: [{ required: true, message: '密码不能为空', trigger: 'blur' }],
        captcha: [{ required: true, message: '验证码不能为空', trigger: 'blur' }]
      },
      captchaPath: ''
    }
  },
  created () {
    this.getCaptcha()
  },
  methods: {
    dataFormSubmit () {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.$http({
            url: this.$http.adornUrl('/sys/login'),
            method: 'post',
            data: this.$http.adornData({
              'username': this.dataForm.userName,
              'password': this.dataForm.password,
              'uuid': this.dataForm.uuid,
              'captcha': this.dataForm.captcha
            })
          }).then(({ data }) => {
            if (data && data.code === 0) {
              this.$cookie.set('token', data.token)
              this.$router.replace({ name: 'home' })
            } else {
              this.getCaptcha()
              this.$message.error(data.msg)
            }
          })
        }
      })
    },
    getCaptcha () {
      this.dataForm.uuid = getUUID()
      this.captchaPath = this.$http.adornUrl(`/captcha.jpg?uuid=${this.dataForm.uuid}`)
    }
  }
}
</script>

<style lang="scss">
.login-wrapper {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, .6);

  &:before {
    content: "";
    position: fixed;
    top: 0; left: 0;
    width: 100%; height: 100%;
    z-index: -1;
    background-image: url(static/img/bg.png);
    background-size: cover;
  }
}
  .login-card {
    width: 400px;
    padding: 40px 30px;
    background: rgba(255, 255, 255, 0.95); // 添加透明度提升背景图片可见性
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.2);

    .login-title {
      text-align: center;
      font-size: 22px;
      margin-bottom: 30px;
      color: #333;
    }

    .captcha-img {
      width: 100%;
      cursor: pointer;
      height: 38px;
      border: 1px solid #dcdfe6;
      border-radius: 4px;
    }

    .login-btn {
      width: 100%;
      margin-top: 10px;
    }
  }
</style>
