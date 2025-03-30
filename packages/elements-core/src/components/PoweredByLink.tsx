import { Box, Flex } from '@stoplight/mosaic';
import * as React from 'react';

export const PoweredByLink: React.FC<{
  source: string;
  pathname: string;
  packageType: 'elements' | 'elements-dev-portal';
  layout?: 'sidebar' | 'stacked';
}> = ({ source, pathname, packageType, layout = 'sidebar' }) => {
  return (
    <Flex
      as="a"
      align="center"
      borderT={layout === 'stacked' ? undefined : true}
      px={layout === 'stacked' ? 1 : 4}
      py={3}
      justify={layout === 'stacked' ? 'end' : undefined}
      href={`https://portal.idf.cts`}
      target="_blank"
      rel="noopener noreferrer"
      userSelect="none"
    >
      <Box className="customizable-powered-by">
        Powered by&nbsp;<strong>IDFCTS</strong>
      </Box>
    </Flex>
  );
};
