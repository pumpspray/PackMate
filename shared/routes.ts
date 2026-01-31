import { z } from 'zod';
import { insertTripSchema, insertGroupSchema, insertGroupMemberSchema, insertItemSchema, insertSavedListSchema, insertSavedListItemSchema, trips, groups, groupMembers, items, savedLists, savedListItems } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  trips: {
    list: {
      method: 'GET' as const,
      path: '/api/trips',
      responses: {
        200: z.array(z.custom<typeof trips.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/trips/:id',
      responses: {
        200: z.custom<typeof trips.$inferSelect & { groups: (typeof groups.$inferSelect & { members: typeof groupMembers.$inferSelect[] })[], items: typeof items.$inferSelect[] }>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/trips',
      input: insertTripSchema,
      responses: {
        201: z.custom<typeof trips.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/trips/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  groups: {
    create: {
      method: 'POST' as const,
      path: '/api/trips/:tripId/groups',
      input: insertGroupSchema.omit({ tripId: true }),
      responses: {
        201: z.custom<typeof groups.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/groups/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    }
  },
  members: {
    create: {
      method: 'POST' as const,
      path: '/api/groups/:groupId/members',
      input: insertGroupMemberSchema.omit({ groupId: true }),
      responses: {
        201: z.custom<typeof groupMembers.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/members/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    }
  },
  items: {
    create: {
      method: 'POST' as const,
      path: '/api/trips/:tripId/items',
      input: insertItemSchema.omit({ tripId: true }),
      responses: {
        201: z.custom<typeof items.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/items/:id',
      input: insertItemSchema.partial(),
      responses: {
        200: z.custom<typeof items.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/items/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
    bulkCreate: {
      method: 'POST' as const,
      path: '/api/trips/:tripId/items/bulk',
      input: z.object({
        items: z.array(insertItemSchema.omit({ tripId: true }))
      }),
      responses: {
        201: z.array(z.custom<typeof items.$inferSelect>()),
      }
    }
  },
  savedLists: {
    list: {
      method: 'GET' as const,
      path: '/api/saved-lists',
      responses: {
        200: z.array(z.custom<typeof savedLists.$inferSelect & { items: typeof savedListItems.$inferSelect[] }>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/saved-lists',
      input: z.object({
        name: z.string(),
        items: z.array(z.object({ name: z.string(), quantity: z.number().default(1) }))
      }),
      responses: {
        201: z.custom<typeof savedLists.$inferSelect>(),
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/saved-lists/:id',
      responses: {
        204: z.void(),
      }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
