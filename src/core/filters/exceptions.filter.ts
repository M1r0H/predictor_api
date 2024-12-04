import { appConfig } from '@app/app.config';
import { PASSWORD_HIDDEN, TOKEN_HIDDEN } from '@core/constants/core.constants';
import { ContextHelper, LoggerHelper } from '@core/helpers';
import { HandlebarsService } from '@core/services';
import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { PathImpl2 } from '@nestjs/config';
import { ContextIdFactory, HttpAdapterHost, ModuleRef } from '@nestjs/core';
import { captureException } from '@sentry/nestjs';
import { Request, Response } from 'express';
import { isObject, pick } from 'lodash';
import { I18nContext } from 'nestjs-i18n';
import { I18nTranslations } from 'resources/i18n/types/i18n.generated';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  public constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly moduleRef: ModuleRef,
  ) {
  }

  public skipIf(host: ArgumentsHost): boolean {
    return host.getType() as string === 'telegraf';
  }

  public log(exception: Error): void {
    LoggerHelper.error(exception.message, exception.name, 'Application');
    LoggerHelper.debug(exception.stack, exception.name);
  }

  public verbose(host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const headers = request?.headers;
    const ip = request?.headers['x-forwarded-for'] || request?.ip;

    LoggerHelper.verbose(JSON.stringify({
      ip,
      context: pick(ContextHelper.dump(), appConfig.app.debug.cls),
      endpoint: request.originalUrl
        ?.replace(/(\/auth\/refresh\/)([\w._-]*?)(\?.*)?$/, `$1${ TOKEN_HIDDEN }$3`)
        ?.replace(/(\?token=)(.*?)(&)/, `$1${ TOKEN_HIDDEN }$3`),
      headers: pick(headers, appConfig.app.debug.headers),
      payload: appConfig.app.debug.body
        ? { ...request.body, ...(request.body?.password ? { password: PASSWORD_HIDDEN } : {}) }
        : undefined,
    }), 'Request');
  }

  public async catch(exception: Error, host: ArgumentsHost): Promise<void> {
    captureException(exception);

    if (this.skipIf(host)) {
      // todo: send error?
      this.log(exception);

      return;
    }

    const i18n = I18nContext.current<I18nTranslations>(host);
    // In certain situations `httpAdapter` might not be available in the
    // constructor method, thus we should resolve it here.
    const { httpAdapter } = this.httpAdapterHost;
    // const logger = new Logger();
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const contextId = ContextIdFactory.getByRequest(request);
    const acceptHeader = request.headers?.['accept'] ?? '';
    const isHtml = acceptHeader && acceptHeader.includes('text/html');

    this.log(exception);
    this.verbose(host);

    response.setHeader(
      'Content-Type',
      isHtml ? 'text/html' : 'application/json',
    );

    if (isHtml) {
      const handlebarsService = await this.moduleRef.resolve(HandlebarsService, contextId, { strict: false });
      const html = handlebarsService.render('errors.template', exception);

      response.send(html);

      return;
    }

    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = exception instanceof HttpException
      ? exception.getResponse()
      : exception.message;

    httpAdapter.reply(
      ctx.getResponse(),
      (isObject(message)
        ? {
            ...message,
            message: i18n?.t
              ? i18n.t((message as {message: string}).message as PathImpl2<I18nTranslations>)
              : exception.message,
          }
        : {
            message: i18n?.t ? i18n.t(exception.message as PathImpl2<I18nTranslations>) : exception.message,
            name: 'error',
          }),
      status,
    );
  }
}

// @Catch(HttpException)
// export class HttpExceptionFilter extends BaseExceptionFilter {
//   public constructor(private readonly moduleRef: ModuleRef) {
//     super();
//   }
//
//   public async catch(exception: HttpException, host: ArgumentsHost): Promise<void> {
//     const i18n = I18nContext.current<I18nTranslations>(host);
//     const ctx = host.switchToHttp();
//     const response = ctx.getResponse<Response>();
//     const request = ctx.getRequest<Request>();
//     const contextId = ContextIdFactory.getByRequest(request);
//     const status = exception.getStatus();
//     const exceptionResponse = exception.getResponse();
//     const acceptHeader = request.headers['accept'];
//     const isHtml = acceptHeader && acceptHeader.includes('text/html');
//
//     response.setHeader(
//       'Content-Type',
//       isHtml ? 'text/html' : 'application/json',
//     );
//
//     if (isHtml) {
//       const handlebarsService = await this.moduleRef.resolve(HandlebarsService, contextId, { strict: false });
//       const html = handlebarsService.render('errors.template', exception);
//
//       response.send(html);
//
//       return;
//     }
//
//     response.status(status).json(isObject(exceptionResponse) ? exceptionResponse : {
//       message: i18n.t(exception.message as PathImpl2<I18nTranslations>),
//       name: 'error', // i18n.t('core.error'),
//     });
//   }
// }
