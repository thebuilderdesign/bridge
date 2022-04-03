<template>
  <CDrawer v-bind="$attrs" v-on="$listeners">
    <div class="content">
      <div class="header">
        <div class="title">{{ $t('home.selectTokenBasic.title') }}</div>
        <div class="input">
          <CInput
            v-model="keyword"
            class="input-inner"
            :placeholder="$t('home.selectTokenBasic.inputPlaceholder')"
          />
        </div>
        <div class="popular-token-basics">
          <CButton
            v-for="tokenBasic in topTokenBasics"
            :key="tokenBasic.name"
            class="popular-token-basic"
            :class="{ selected: tokenBasicName === tokenBasic.name }"
            @click="select(tokenBasic)"
          >
            <img class="popular-token-basic-icon" :src="tokenBasic.meta" />
            <span class="popular-token-basic-name">{{ tokenBasic.name }}</span>
          </CButton>
        </div>
      </div>

      <div class="hint">{{ $t('home.selectTokenBasic.hint') }}</div>
      <CDivider />
      <div class="scroll">
        <div
          v-for="tokenBasic in filteredTokenBasics"
          :key="tokenBasic.name"
          class="token-basic"
          @click="select(tokenBasic)"
        >
          <span class="token-basic-left">
            <img class="token-basic-icon" :src="tokenBasic.meta" />
            <span>{{ tokenBasic.name }}</span>
          </span>
          <img v-if="tokenBasicName === tokenBasic.name" src="@/assets/svg/check.svg" />
        </div>
      </div>
    </div>
  </CDrawer>
</template>

<script>
import { TOP_TOKEN_BASIC_NAMES } from '@/utils/values';

export default {
  name: 'SelectTokenBasic',
  inheritAttrs: false,
  props: {
    tokenBasicName: String,
    tokenBasics: Array,
    popularTokenBasics: Array,
  },
  data() {
    return {
      keyword: '',
    };
  },
  computed: {
    filteredTokenBasics() {
      return this.tokenBasics.filter(tokenBasic => {
        return tokenBasic.name.toLowerCase().includes(this.keyword.toLowerCase());
      });
    },
    topTokenBasics() {
      return TOP_TOKEN_BASIC_NAMES.map(name => this.$store.getters.getTokenBasic(name)).filter(
        item => item,
      );
    },
  },
  methods: {
    select(tokenBasic) {
      this.$emit('update:visible', false);
      this.$emit('update:tokenBasicName', tokenBasic.name);
    },
  },
};
</script>

<style lang="scss" scoped>
.content {
  display: flex;
  flex-direction: column;
  width: 500px;
  height: 100vh;
  background: #7d5040;
  box-shadow: 0px 2px 18px 7px rgba(#000000, 0.1);
}

.header {
  padding: 80px 50px 40px;
  @include child-margin-v(20px);
}

.title {
  font-weight: 500;
}

.input {
  padding: 16px 20px;
  background: rgba(#000000, 0.26);
  border: 1px solid transparent;
  border-radius: 4px;
  transition: all 0.3s;

  &:hover {
    border: 1px solid #2fd8ca;
  }

  input:focus::placeholder {
    color: transparent;
  }
}

.popular-token-basics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}

.popular-token-basic {
  height: 30px;
  padding: 0 16px;
  border-radius: 15px;
  background: rgba(#000000, 0.3);
  border: 1px solid transparent;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: left;
  @include child-margin-h(4px);

  &.selected {
    border: 1px solid #2fd8ca;
  }
}

.popular-token-basic-icon {
  width: 16px;
}

.popular-token-basic-name {
  font-size: 14px;
}

.hint {
  padding: 0 50px;
  opacity: 0.8;
  font-size: 12px;
  @include next-margin-v(17px);
}

.scroll {
  flex: 1;
  padding: 8px 10px;
  overflow-y: auto;
  @include scroll-bar(rgba(#fff, 0.2), transparent);
}

.token-basic {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  padding: 0 40px;
  transition: all 0.3s;
  @include child-margin-h(16px);

  &:hover {
    background: rgba(#000000, 0.3);
    opacity: 0.8;
  }
}

.token-basic-left {
  display: flex;
  align-items: center;
  @include child-margin-h(8px);
}

.token-basic-icon {
  width: 24px;
  border-radius: 12px;
}
</style>
<style lang="scss" scoped>
@media screen and (max-width: 900px) {
  .content {
    width: 100vw;
  }
  .header {
    padding: 80px 20px 40px;
  }
  .hint {
    padding: 0 20px;
  }
  .token-basic {
    padding: 0 20px;
  }
  .popular-token-basics {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
