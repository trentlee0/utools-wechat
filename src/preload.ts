import {
  hideAndOutPlugin,
  templateBuilder,
  MutableListTemplate,
  Action,
  ListItem,
  ListRenderFunction
} from 'utools-utils'

interface RequestOptions {
  url: string
  method: string
  body?: object
}

function request<T>(options: RequestOptions) {
  return new Promise<{ data: T; status: number }>((resolve, reject) => {
    const ajax = new XMLHttpRequest()
    ajax.open(options.method, options.url, true)
    if (options.method.toUpperCase() === 'POST') {
      ajax.setRequestHeader('Content-Type', 'application/json')
      ajax.send(JSON.stringify(options.body))
    } else {
      ajax.send()
    }
    ajax.addEventListener('readystatechange', (e) => {
      if (ajax.readyState !== 4) return
      const { status, responseText } = ajax
      if (200 <= status && status < 300) {
        resolve({ data: JSON.parse(responseText), status })
      } else {
        reject({ status })
      }
    })
  })
}

interface WeChatContact {
  icon: { path: string | null }
  title: string
  subtitle: string
  arg: string
  valid: number
}

async function searchContacts(keyword?: string) {
  const { data } = await request<{ items: Array<WeChatContact> }>({
    url: 'http://localhost:48065/wechat/search?keyword=' + (keyword ?? ''),
    method: 'get'
  })
  return data.items
}

async function openSession(sessionId: string) {
  await request<void>({
    url: 'http://localhost:48065/wechat/start?session=' + (sessionId ?? ''),
    method: 'get'
  })
}

interface WeChatItem extends ListItem {
  arg: string
  valid: number
}

class Contacts implements MutableListTemplate {
  code = 'contacts'
  placeholder = '搜索联系人，回车打开聊天窗口'

  private async mapItems(contacts: Array<WeChatContact>) {
    const res: Array<WeChatItem> = []
    for (const contact of contacts) {
      const { title, subtitle, arg, valid } = contact
      const icon = 'file://' + contact.icon.path
      res.push({ title, description: subtitle, icon, arg, valid })
    }
    return res
  }

  async enter(action: Action, render: ListRenderFunction) {
    render(await this.mapItems(await searchContacts()))
  }

  async search(action: Action, searchWord: string, render: ListRenderFunction) {
    render(await this.mapItems(await searchContacts(searchWord)))
  }

  async select(action: Action, item: WeChatItem) {
    hideAndOutPlugin()
    await openSession(item.arg)
  }
}

window.exports = templateBuilder().mutableList(new Contacts()).build()
