import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import {
  ApolloFederationDriver,
  ApolloFederationDriverConfig,
} from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ComplexityPlugin } from './lib/graphql/complexityPlugin';
import { ResourceCleanupPlugin } from './lib/graphql/resourceCleanupPlugin';
import { DataSource } from 'typeorm';
import depthLimit from 'graphql-depth-limit';
import { ConfigService } from '@nestjs/config';

@Module({
  providers: [ComplexityPlugin, ResourceCleanupPlugin],
  imports: [
    GraphQLModule.forRootAsync<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      inject: [DataSource, ConfigService],
      useFactory: async (dataSource: DataSource, config: ConfigService) => {
        return {
          autoSchemaFile: {
            path: './schema.gql',
            federation: 2,
          },
          nodeEnv: config.get('ENV'),
          tracing: config.get('TRACING'),
          debug: config.get('DEBUG'),
          playground: config.get('PLAYGROUND'),
          plugins: [
            ApolloServerPluginLandingPageLocalDefault({
              embed: true,
            }),
          ],
          validationRules: [depthLimit(10)],
          context: async ({ req }) => {
            const { user } = req;
            const accessToken = req.headers.authorization || '';
            const eventName = req.headers['x-audit-eventname'];
            const eventId = req.headers['x-event-id'];
            const remoteAddress =
              req.headers['x-forward-for'] || req.socket.remoteAddress;
            const referer = req.headers.referer;
            const tenantQueryRunner = dataSource.createQueryRunner();

            if (user && user.tenantId) {
              const query = `SET app.current_tenant_id = ${user.tenantId}`;
              await tenantQueryRunner.query(query);
            }

            return {
              user,
              accessToken,
              eventId,
              eventName,
              remoteAddress,
              referer,
              tenantQueryRunner,
            };
          },
        };
      },
    }),
  ],
})
export class GraphqlModule {}
