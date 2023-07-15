import * as moment from 'moment';
import * as morgan from 'morgan';

morgan.token('method', (req) => {
  let backgroundColor = '47';

  switch (req.method) {
    case 'GET':
      backgroundColor = '48;5;75';
      break;
    case 'POST':
      backgroundColor = '48;5;119';
      break;
    case 'PUT':
      backgroundColor = '48;5;214';
      break;
    case 'PATCH':
      backgroundColor = '48;5;194';
      break;
    case 'DELETE':
      backgroundColor = '41';
      break;
  }

  return `\x1b[${backgroundColor}m\x1b[30m ${req.method} \x1b[0m`;
});

morgan.token('url', (req) => {
  return `\x1b[36m${req.url}\x1b[0m`;
});

morgan.token('status', (req, res) => {
  let color = '32';

  if (res.statusCode >= 500) {
    color = '31';
  } else if (res.statusCode >= 400) {
    color = '33';
  } else if (res.statusCode >= 300) {
    color = '36';
  }

  return `\x1b[${color}m${res.statusCode}\x1b[0m`;
});

morgan.token('date', () => {
  return `\x1b[90m${moment().format('DD.MM HH:mm:ss.SSS')}\x1b[0m`;
});

export const morganLogger = morgan(
  ':date :method :status :url - :response-time ms',
  {
    skip: (req: Request) => {
      if (req.method === 'OPTIONS') {
        return true;
      }
      if (req.url.startsWith('docs')) {
        return true;
      }
      if (req.url.startsWith('public')) {
        return true;
      }
      return false;
    },
  },
);
