<template>
  <v-container>
    <v-row class="row-title">
      <h2>Список клиентов</h2>
      <v-spacer/>
      <v-btn
        color="primary"
        class="white--text"
        @click="setDefaultClients"
      >
        <span class="mr-2">Получить список</span>
      </v-btn>
      <v-btn
        color="error"
        class="white--text mx-2"
        @click="resetClients"
      >
        <span class="mr-2">Очистить список</span>
      </v-btn>
      <v-btn
        color="teal"
        class="white--text"
        @click="createItem"
      >
        <v-icon>mdi-plus</v-icon>
        <span class="mr-2">Добавить клиента</span>
      </v-btn>
    </v-row>
    <v-row class="text-center">
      <v-col>
        <v-data-table
          :headers="headers"
          :items="clients"
          :items-per-page="10"
          item-class="item"
          class="clients-list"
          :loading="loading"
          loading-text="Загрузка..."
          @click:row="clickRow"
        >
          <template v-slot:item.photo="{ item }">
            <div
              v-if="item.photo"
              class="item-photo-wrap"
            >
              <div class="item-photo">
                <v-img
                  width="36px"
                  height="36px"
                  :src="item.photo"
                />
              </div>
            </div>
            <v-icon size="36px" v-else>mdi-account-circle</v-icon>
          </template>
          <template v-slot:item.gender="{ item }">
            {{ item.gender === 'male' ? 'Муж.' : 'Жен.' }}
          </template>
          <template v-slot:item.hasFamily="{ item }">
            {{ item.hasFamily ? 'Есть' : 'Нет' }}
          </template>
          <template v-slot:item.actions="{ item }">
            <v-icon
              class="mr-3"
              @click="editItem(item)"
            >
              mdi-pencil
            </v-icon>
            <v-icon
              @click.stop="deleteItem(item)"
            >
              mdi-delete
            </v-icon>
          </template>
        </v-data-table>
      </v-col>
    </v-row>
    <v-dialog
      v-model="dialogEdit"
      max-width="500px"
    >
      <v-form
        ref="form"
        v-model="valid"
        lazy-validation
      >
        <v-card>
          <v-card-text>
            <v-container>
              <v-row>
                <v-col>
                  <v-text-field
                    v-model="editedItem.fullName"
                    :counter="80"
                    :rules="fullNameRules"
                    label="ФИО"
                    required
                    @input="$refs.form.resetValidation()"
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row>
                <v-col
                  cols="12"
                  sm="6"
                  md="4"
                >
                  <v-dialog
                    ref="dialog"
                    v-model="dateModal"
                    :return-value.sync="editedItem.date"
                    persistent
                    width="290px"
                  >
                    <template v-slot:activator="{ on, attrs }">
                      <v-text-field
                        v-model="editedItem.date"
                        label="Дата рождения"
                        prepend-icon="mdi-calendar"
                        readonly
                        v-bind="attrs"
                        v-on="on"
                      ></v-text-field>
                    </template>
                    <v-date-picker
                      v-model="editedItemDateFormatted"
                      scrollable
                    >
                      <v-spacer></v-spacer>
                      <v-btn
                        text
                        color="primary"
                        @click="dateModal = false"
                      >
                        Cancel
                      </v-btn>
                      <v-btn
                        text
                        color="primary"
                        @click="$refs.dialog.save(editedItem.date)"
                      >
                        OK
                      </v-btn>
                    </v-date-picker>
                  </v-dialog>
                </v-col>
                <v-col
                  cols="12"
                  sm="6"
                  md="4"
                >
                  <v-select
                    v-model="editedItem.gender"
                    :items="genders"
                    label="Пол"
                    item-text="label"
                    item-value="id"
                  ></v-select>
                </v-col>
                <v-col
                  cols="12"
                  sm="6"
                  md="4"
                >
                  <v-checkbox
                    v-model="editedItem.hasFamily"
                    :label="editedItem.hasFamily ? 'Есть семья' : 'Нет семьи'"
                  ></v-checkbox>
                </v-col>
              </v-row>
              <v-row>
                <v-col>
                  <div class="web-camera-container">
                    <div
                      v-if="editedItem.photo"
                      class="remove-photo"
                      @click="editedItem.photo = null"
                    >
                      <v-icon
                        size="24px"
                        color="#FFFFFF"
                      >
                        mdi-close
                      </v-icon>
                    </div>
                    <v-btn
                      v-show="!isCameraOpen"
                      color="darken-1"
                      text
                      width="420px"
                      height="420px"
                      @click="toggleCamera"
                    >
                      <v-img
                        v-if="editedItem.photo"
                        :src="editedItem.photo"
                        width="240px"
                        height="240px"
                      />
                      <v-icon
                        v-else
                        size="240px"
                      >
                        mdi-account
                      </v-icon>
                    </v-btn>
                    <template v-if="isCameraOpen">
                      <div v-if="isLoading" class="camera-loading">
                        <ul class="loader-circle">
                          <li></li>
                          <li></li>
                          <li></li>
                        </ul>
                      </div>
                      <div v-show="!isLoading"
                           class="camera-box"
                           :class="{ 'flash' : isShotPhoto }"
                      >
                        <div
                          class="camera-shutter"
                          :class="{'flash' : isShotPhoto}"
                        />
                        <video
                          v-show="!isPhotoTaken"
                          ref="camera"
                          :width="450"
                          :height="337.5"
                          autoplay
                        ></video>
                        <canvas
                          v-show="isPhotoTaken"
                          id="photoTaken"
                          ref="canvas"
                          :width="450"
                          :height="337.5"
                        ></canvas>
                      </div>
                      <div
                        v-if="!isLoading"
                        class="camera-shoot"
                      >
                        <v-btn
                          width="60px"
                          height="60px"
                          icon
                          @click="takePhoto"
                        >
                          <v-icon size="60px">mdi-camera</v-icon>
                        </v-btn>
                      </div>
                    </template>
                  </div>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>

          <v-card-actions>
            <v-btn
              color="darken-1"
              text
              @click="close"
            >
              Отменить
            </v-btn>
            <v-spacer/>
            <v-btn
              color="teal darken-1"
              text
              @click="save"
            >
              Сохранить
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>
    <v-dialog
      v-model="dialogDelete"
      max-width="380px"
    >
      <v-card>
        <v-card-title>Хотите удалить данного клиента?</v-card-title>
        <v-card-actions class="actions">
          <v-spacer></v-spacer>
          <v-btn color="darken-1" text @click="closeDelete">Отменить</v-btn>
          <v-btn color="error darken-1" text @click="deleteItemConfirm">Удалить</v-btn>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  name: 'ClientsList',
  data: () => ({
    valid: true,
    fullNameRules: [
      v => !!v || 'ФИО обязательно',
      v => (v && v.length >= 2) || 'Минимум 3 символа',
      v => (v && v.length <= 81) || 'Максимум 80 символа'
    ],
    genders: [
      {
        id: 'male',
        label: 'Муж.'
      },
      {
        id: 'female',
        label: 'Жен.'
      }
    ],
    dialogEdit: false,
    dialogDelete: false,
    dateModal: false,
    editedItem: {
      id: null,
      fullName: null,
      date: null,
      gender: null,
      hasFamily: null,
      photo: null
    },
    defaultItem: {
      id: null,
      fullName: null,
      date: null,
      gender: null,
      hasFamily: null,
      photo: null
    },
    isCameraOpen: false,
    isPhotoTaken: false,
    isShotPhoto: false,
    isLoading: false,
    link: '#'
  }),
  computed: {
    ...mapState({
      loading: (state) => state.loading,
      clients: (state) => state.clients
    }),
    headers () {
      return [
        {
          text: '',
          align: 'center',
          sortable: false,
          value: 'photo',
          width: '50px'
        },
        {
          text: 'ФИО',
          align: 'start',
          sortable: true,
          value: 'fullName'
        },
        {
          text: 'Дата рождения',
          value: 'date'
        },
        {
          text: 'Пол',
          value: 'gender'
        },
        {
          text: 'Есть семья',
          value: 'hasFamily'
        },
        {
          text: 'Actions',
          align: 'right',
          value: 'actions',
          sortable: false
        }
      ]
    },
    editedItemDateFormatted: {
      get () {
        return this.parseDate(this.editedItem.date)
      },
      set (val) {
        this.editedItem.date = this.formatDate(val)
      }
    }
  },
  methods: {
    ...mapActions({
      addClient: 'addClient',
      updateClient: 'updateClient',
      removeClient: 'removeClient',
      resetClients: 'resetClients',
      setDefaultClients: 'setDefaultClients'
    }),
    clickRow (item) {
      this.editItem(item)
    },
    createItem () {
      this.editedItem = Object.assign({}, this.defaultItem)
      this.editedItem.id = this.clients.length + 1
      this.editedItem.date = this.formatDate((new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().substr(0, 10))
      this.dialogEdit = true
    },
    editItem (item) {
      this.editedIndex = this.clients.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.dialogEdit = true
    },
    deleteItem (item) {
      this.editedIndex = this.clients.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.dialogDelete = true
    },
    deleteItemConfirm (item) {
      this.removeClient(item)
      this.closeDelete()
    },
    close () {
      this.dialogEdit = false
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.isCameraOpen = false
        this.isPhotoTaken = false
        this.isShotPhoto = false
        this.isLoading = false
        this.link = '#'
        this.$refs.form.resetValidation()
        this.$refs.form.reset()
      })
    },
    closeDelete () {
      this.dialogDelete = false
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.$refs.form.resetValidation()
        this.$refs.form.reset()
      })
    },
    save () {
      this.$refs.form.validate()
      this.$nextTick(() => {
        if (this.valid) {
          this[this.clients.find((item) => item.id === this.editedItem.id) ? 'updateClient' : 'addClient'](this.editedItem)
          this.$nextTick(() => {
            this.close()
          })
        }
      })
    },
    formatDate (date) {
      if (!date) return null

      const [year, month, day] = date.split('-')
      return `${day}.${month}.${year}`
    },
    parseDate (date) {
      if (!date) return null

      const [day, month, year] = date.split('.')
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
    },
    toggleCamera () {
      if (this.isCameraOpen) {
        this.isCameraOpen = false
        this.isPhotoTaken = false
        this.isShotPhoto = false
        this.stopCameraStream()
      } else {
        this.isCameraOpen = true
        this.createCameraElement()
      }
    },
    createCameraElement () {
      this.isLoading = true
      const constraints = (window.constraints = {
        audio: false,
        video: true
      })
      navigator.mediaDevices
        .getUserMedia(constraints)
        .then(stream => {
          this.isLoading = false
          this.$refs.camera.srcObject = stream
        })
        .catch(() => {
          this.isLoading = false
          alert('May the browser didn\'t support or there is some errors.')
        })
    },
    stopCameraStream () {
      const tracks = this.$refs.camera.srcObject.getTracks()
      tracks.forEach(track => {
        track.stop()
      })
    },
    takePhoto () {
      if (!this.isPhotoTaken) {
        this.isShotPhoto = true
        const FLASH_TIMEOUT = 50
        setTimeout(() => {
          this.isShotPhoto = false
        }, FLASH_TIMEOUT)
      }
      this.isPhotoTaken = !this.isPhotoTaken
      const context = this.$refs.canvas.getContext('2d')
      context.drawImage(this.$refs.camera, 0, 0, 450, 337.5)
      this.editedItem.photo = document
        .getElementById('photoTaken')
        .toDataURL('image/jpeg')
        .replace('image/jpeg', 'image/octet-stream')
    }
  }
}
</script>

<style lang="scss">
.row-title {
  align-items: center;
  padding: 0 12px;
}

.clients-list {
  thead > tr > td {
    font-weight: 300;
    color: rgba(0, 0, 0, .54) !important;
  }

  tbody > tr {
    &:hover {
      td {
        background-color: #009688 !important;
        color: #FFFFFF !important;
        cursor: pointer;

        .theme--light.v-icon {
          color: #FFFFFF !important;
        }
      }
    }
  }
}

.item-photo {
  display: block;
  width: 36px;
  height: 36px;
  margin: 0;
  padding: 0;
  border-radius: 50%;
  overflow: hidden;
}

.item-photo-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
}

.web-camera-container {
  margin: 0;
  padding: 0 24px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  min-height: 460px;
  position: relative;
  z-index: 5;

  .remove-photo {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    background: #009688;
    border-radius: 50%;
    position: absolute;
    right: calc(50% - 15px);
    top: calc(50% - 15px);
    z-index: 10;
    cursor: pointer;
  }

  .camera-button {
    margin-bottom: 2rem;
  }

  .camera-box {
    .camera-shutter {
      opacity: 0;
      width: 450px;
      height: 337.5px;
      background-color: #fff;
      position: absolute;

      &.flash {
        opacity: 1;
      }
    }
  }

  .camera-shoot {
    margin: 1rem 0;

    button {
      height: 60px;
      width: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 100%;

      img {
        height: 35px;
        object-fit: cover;
      }
    }
  }

  .camera-loading {
    overflow: hidden;
    height: 100%;
    position: absolute;
    width: 100%;
    min-height: 150px;
    margin: 3rem 0 0 -1.2rem;

    ul {
      height: 100%;
      position: absolute;
      width: 100%;
      z-index: 999999;
      margin: 0;
    }

    .loader-circle {
      display: block;
      height: 14px;
      margin: 0 auto;
      top: 50%;
      left: 100%;
      transform: translateY(-50%);
      transform: translateX(-50%);
      position: absolute;
      width: 100%;
      padding: 0;

      li {
        display: block;
        float: left;
        width: 10px;
        height: 10px;
        line-height: 10px;
        padding: 0;
        position: relative;
        margin: 0 0 0 4px;
        background: #999;
        animation: preload 1s infinite;
        top: -50%;
        border-radius: 100%;

        &:nth-child(2) {
          animation-delay: .2s;
        }

        &:nth-child(3) {
          animation-delay: .4s;
        }
      }
    }
  }

  @keyframes preload {
    0% {
      opacity: 1
    }
    50% {
      opacity: .4
    }
    100% {
      opacity: 1
    }
  }
}
</style>
