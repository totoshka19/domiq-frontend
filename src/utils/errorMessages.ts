export const ERROR_MESSAGES: Record<number, string> = {
  400: 'Неверные данные запроса',
  401: 'Войдите в аккаунт',
  403: 'У вас нет прав для этого действия',
  404: 'Не найдено',
  422: 'Проверьте введённые данные',
  429: 'Слишком много запросов, подождите немного',
  500: 'Ошибка сервера, попробуйте позже',
};

export function getErrorMessage(status: number): string {
  return ERROR_MESSAGES[status] ?? 'Что-то пошло не так';
}
