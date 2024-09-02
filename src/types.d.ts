// types/types.d.ts

import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      maxPreco?: number;
      user?: Usuario; 
    }
  }
}
