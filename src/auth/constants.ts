import { env } from 'src/utils/env';

export const jwtConstants = {
  secret: env.JWT_SECRET,
};
