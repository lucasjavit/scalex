import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

export const CurrentUserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    // If user object exists, return its id
    if (request.user?.id) {
      return request.user.id;
    }
    // Otherwise, try to get from headers (for development/testing)
    return request.headers['x-user-id'];
  },
);