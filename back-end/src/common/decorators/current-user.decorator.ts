import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    // If a specific field is requested (e.g., 'id'), return only that field
    // Otherwise, return the entire user object
    return data ? user?.[data] : user;
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
