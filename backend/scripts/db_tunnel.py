"""本地开发用 SSH 隧道：把服务器 5432 端口映射到本机 5433。

用法：
    python scripts/db_tunnel.py
然后在 backend 目录设置 DLM_DATABASE_PORT=5433（见 .env.example）。
"""
import socket
import threading

import paramiko

HOST = "139.196.139.93"
USER = "root"
PASSWORD = "Linux99!"
LISTEN_HOST = "127.0.0.1"
LISTEN_PORT = 5433
REMOTE = ("127.0.0.1", 5432)


def relay(src, dst):
    try:
        while True:
            data = src.recv(32768)
            if not data:
                break
            dst.sendall(data)
    except Exception:
        pass
    finally:
        for s in (src, dst):
            try:
                s.close()
            except Exception:
                pass


def handle_client(local_sock, transport):
    try:
        chan = transport.open_channel("direct-tcpip", REMOTE, local_sock.getpeername())
    except Exception as e:
        print(f"[tunnel] 无法建立通道: {e}")
        local_sock.close()
        return
    if chan is None:
        local_sock.close()
        return
    threading.Thread(target=relay, args=(local_sock, chan), daemon=True).start()
    threading.Thread(target=relay, args=(chan, local_sock), daemon=True).start()


def main():
    transport = paramiko.Transport((HOST, 22))
    transport.connect(username=USER, password=PASSWORD)
    listener = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    listener.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    listener.bind((LISTEN_HOST, LISTEN_PORT))
    listener.listen(128)
    print(f"[tunnel] 已建立 {LISTEN_HOST}:{LISTEN_PORT} -> {HOST}:{REMOTE[1]} (Ctrl+C 退出)")
    try:
        while True:
            local_sock, _ = listener.accept()
            threading.Thread(target=handle_client, args=(local_sock, transport), daemon=True).start()
    except KeyboardInterrupt:
        print("[tunnel] 已退出")
    finally:
        transport.close()
        listener.close()


if __name__ == "__main__":
    main()
