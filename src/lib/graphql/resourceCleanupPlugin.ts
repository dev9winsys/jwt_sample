import { ApolloServerPlugin, GraphQLRequestListener } from '@apollo/server';
import { Plugin } from '@nestjs/apollo';
import { QueryRunner } from 'typeorm';

@Plugin()
export class ResourceCleanupPlugin implements ApolloServerPlugin {
  async requestDidStart(): Promise<GraphQLRequestListener<any>> {
    return {
      async willSendResponse(context) {
        const tenantQueryRunner: QueryRunner =
          context.contextValue?.tenantQueryRunner;
        if (!tenantQueryRunner) {
          return;
        }

        try {
          const query = 'RESET app.current_tenant_id';
          await tenantQueryRunner.query(query);
        } finally {
          if (!tenantQueryRunner.isReleased) {
            await tenantQueryRunner.release();
          }
        }
      },
    };
  }
}
