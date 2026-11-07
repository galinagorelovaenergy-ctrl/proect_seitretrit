# Установка конфигурации Caddy на Timeweb Cloud

Эта инструкция для сервера. Из репозитория она сама не применяется. DNS, SSL и панель хостинга здесь не меняются автоматически.

Сайт — статические HTML-файлы. Сервер уже отвечает заголовком `Server: Caddy`. Несуществующие адреса сейчас отдают `index.html` со статусом 200. Нужно убрать это правило и включить настоящий 404.

## Что подготовить

1. Загрузить на хостинг новый файл `404.html` вместе с остальным сайтом (в тот же корень, где лежит `index.html`).
2. Иметь доступ по SSH к облачному серверу Timeweb Cloud либо возможность править Caddyfile в панели.
3. Знать каталог сайта на диске. Часто это `/var/www/...` или `/srv/...`. Проверьте, где лежат `index.html` и `404.html`.

Файл `Caddyfile.example` в проекте — образец. Рабочий конфиг обычно здесь: `/etc/caddy/Caddyfile`.

## Чего не делать

- Не добавлять `try_files {path} /index.html`.
- Не делать `redir * /` и не отправлять все неизвестные адреса на главную.
- Не менять A-записи DNS: `retritbest.ru` и `www.retritbest.ru` уже указывают на один IP.
- Не выпускать сертификат вручную: Caddy уже обслуживает HTTPS на обоих именах.
- Не включать в панели Timeweb отдельный «редирект домена» только на главную — он часто теряет путь.

## Шаги на сервере

1. Сделайте копию текущего конфига:

```bash
sudo cp /etc/caddy/Caddyfile /etc/caddy/Caddyfile.bak
sudo nano /etc/caddy/Caddyfile
```

2. Найдите и удалите строку вида:

```caddy
try_files {path} /index.html
```

Если вместо неё стоит `try_files {path} /`, её тоже нужно убрать.

3. Приведите сайт к виду ниже. Путь в `root` замените на реальный каталог с `index.html` и `404.html`.

```caddy
www.retritbest.ru {
	redir https://retritbest.ru{uri} permanent
}

retritbest.ru {
	root * /var/www/retritbest.ru
	encode gzip
	file_server
	handle_errors {
		rewrite * /404.html
		file_server
	}
}
```

`{uri}` сохраняет путь и параметры, например  
`https://www.retritbest.ru/programs.html?utm=1` → `https://retritbest.ru/programs.html?utm=1`.  
`permanent` даёт HTTP 301.

4. Проверьте синтаксис и перечитайте конфиг:

```bash
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

Если сайт в Docker/Apps Timeweb, вставьте те же блоки в конфиг контейнера и перезапустите приложение. Команды systemd могут отличаться.

## Проверка после установки

С компьютера или с сервера:

```bash
# Должен быть 404, в теле — «Страница не найдена»
curl -sI https://retritbest.ru/no-such-page
curl -s https://retritbest.ru/no-such-page | findstr /C:"Страница не найдена"

# Рабочие страницы остаются 200
curl -sI https://retritbest.ru/
curl -sI https://retritbest.ru/programs.html
curl -sI https://retritbest.ru/articles.html
curl -sI https://retritbest.ru/robots.txt
curl -sI https://retritbest.ru/sitemap.xml

# www должен уйти на основной домен с тем же путём (301 или 308)
curl -sI https://www.retritbest.ru/programs.html
```

Ожидание для www: `Location: https://retritbest.ru/programs.html`.

Прямой запрос `https://retritbest.ru/404.html` может быть 200: это сам файл. Для поисковика важны несуществующие адреса со статусом 404.

## Если 404 по-прежнему 200

- `404.html` не попал в тот каталог, который указан в `root`.
- Строка `try_files {path} /index.html` осталась в конфиге или в другом импортированном файле.
- Перезагрузка Caddy не прошла: `sudo systemctl status caddy`.

## Что эта инструкция не делает

Не подключается к серверу, не меняет DNS, SSL, `robots.txt`, `sitemap.xml` и canonical существующих страниц. После правок на хостинге нужно один раз проверить URL из списка выше.
