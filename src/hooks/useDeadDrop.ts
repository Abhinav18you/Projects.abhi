import { useEffect, useRef, useState, useCallback } from 'react';
import Peer, { DataConnection } from 'peerjs';
import { logToTerminal } from '../utils/log';

export const useDeadDrop = () => {
  const [peerId, setPeerId] = useState<string | null>(null);
  const [connection, setConnection] = useState<DataConnection | null>(null);
  const [incomingFile, setIncomingFile] = useState<{ blob: Blob; name: string } | null>(null);
  const peerRef = useRef<Peer | null>(null);
  const fileRef = useRef<Blob | null>(null);

  const initializeDeadDrop = useCallback(async (file: Blob, fileName: string) => {
    logToTerminal('INITIALIZING DEAD DROP PROTOCOL...');
    fileRef.current = file;

    // Cleanup previous if exists
    if (peerRef.current) {
      peerRef.current.destroy();
    }

    const peer = new Peer();
    peerRef.current = peer;

    return new Promise<string>((resolve, reject) => {
      peer.on('open', (id) => {
        setPeerId(id);
        logToTerminal(`SECURE CHANNEL ESTABLISHED. ID: ${id}`);
        // We'll use a hash-based route or query param.
        // Assuming the app handles /drop/:id or ?peer=id
        resolve(id);
      });

      peer.on('connection', (conn) => {
        logToTerminal('PEER CONNECTED. HANDSHAKING...');
        setConnection(conn);

        conn.on('open', () => {
            if (fileRef.current) {
                logToTerminal(`SENDING PAYLOAD (${fileRef.current.size} BYTES)...`);
                conn.send({
                    file: fileRef.current,
                    name: fileName,
                    type: fileRef.current.type
                });
                logToTerminal('TRANSFER COMPLETE.');
            } else {
                logToTerminal('ERROR: NO FILE LOADED.');
            }
        });

        conn.on('close', () => {
             logToTerminal('PEER DISCONNECTED.');
             setConnection(null);
        });
      });

      peer.on('error', (err) => {
        logToTerminal(`P2P ERROR: ${err.type}`);
        // Don't reject if already open, just log
        if (!peerId) reject(err);
      });
    });
  }, []);

  const connectToDeadDrop = useCallback((targetPeerId: string) => {
    logToTerminal(`CONNECTING TO DEAD DROP: ${targetPeerId}...`);

    if (peerRef.current) {
        peerRef.current.destroy();
    }

    const peer = new Peer();
    peerRef.current = peer;

    peer.on('open', () => {
        const conn = peer.connect(targetPeerId);
        setConnection(conn);

        conn.on('open', () => {
            logToTerminal('CONNECTED. WAITING FOR PAYLOAD...');
        });

        conn.on('data', (data: any) => {
            if (data && data.file) {
                logToTerminal(`PAYLOAD RECEIVED: ${data.name || 'Unknown'}`);
                setIncomingFile({ blob: data.file, name: data.name || 'received_image' });
            }
        });

        conn.on('error', (err) => {
             logToTerminal(`CONNECTION ERROR: ${err}`);
        });
    });

    peer.on('error', (err) => {
         logToTerminal(`P2P ERROR: ${err.type}`);
    });

  }, []);

  const destroy = useCallback(() => {
    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }
    setPeerId(null);
    setConnection(null);
    setIncomingFile(null);
  }, []);

  useEffect(() => {
    return () => {
      if (peerRef.current) {
        peerRef.current.destroy();
      }
    };
  }, []);

  return { initializeDeadDrop, connectToDeadDrop, peerId, connection, incomingFile, destroy };
};
