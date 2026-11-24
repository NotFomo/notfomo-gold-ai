# NOTFOMO GOLD AI — версия 3

## Что подключено
- `/api/price` — котировка XAU/USD из Twelve Data.
- `/api/calendar` — календарь экономических публикаций США из FMP на ближайшие 7 дней.
- `/api/analyze` — краткий AI-обзор через OpenAI Responses API на основе доступной цены и событий.

## Переменные Vercel
Добавьте в Project → Settings → Environment Variables (Production):
- `TWELVE_DATA_API_KEY`
- `FMP_API_KEY`
- `OPENAI_API_KEY`

Не вставляйте ключи в HTML и не отправляйте их в чат. После изменения переменных сделайте Redeploy.

## Обновление проекта
Замените `index.html` и `vercel.json` в GitHub-репозитории и добавьте папку `api` с тремя файлами:
- `price.js`
- `calendar.js`
- `analyze.js`

После commit Vercel должен автоматически выполнить deployment.

## Проверка после деплоя
Откройте:
- `https://ВАШ-ДОМЕН/api/price`
- `https://ВАШ-ДОМЕН/api/calendar`

Кнопка «Запустить AI-анализ» вызывает `/api/analyze`.

## Важно
FMP указывает для Economic Data Releases Calendar API ограниченный доступ; если тариф не включает endpoint, сервер вернёт понятное сообщение (обычно HTTP 402). Наличие API-ключа не означает доступ ко всем наборам данных. События FMP возвращаются в UTC. OpenAI API оплачивается отдельно от подписки ChatGPT. Цена может быть задержанной и отличаться от котировки брокера. AI-обзор не является торговой рекомендацией.
