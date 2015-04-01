#!/usr/bin/env python
#coding: utf-8

from gevent import monkey
monkey.patch_all()

import sys
import argparse
import dateutil.parser
import pytz
from datetime import datetime
import time
import gevent
import paho.mqtt.client as mqtt

def convert_iso_str(the_str, timezone='Asia/Shanghai'):
    dt = dateutil.parser.parse(the_str)
    return dt.astimezone(pytz.timezone(timezone))

# The callback for when the client receives a CONNACK response from the server.
def on_connect(client, userdata, flags, rc):
    print "{}, client-id={}, Connected with result code={}".format(
        str(datetime.now()), client.cid, rc)

    # Subscribing in on_connect() means that if we lose the connection and
    # reconnect then subscriptions will be renewed.
    client.subscribe(client.TOPIC, qos=1)

# The callback for when a PUBLISH message is received from the server.
def on_message(client, userdata, msg):
    print '{}, client-id={}, topic={}, message={}, qos={}'.format(
        str(datetime.now()), client.cid, msg.topic, msg.payload, msg.qos)

def start_client(args, i):
    client = mqtt.Client()
    client.cid = i
    client.TOPIC = args.topic
    client.on_connect = on_connect
    client.on_message = on_message
    # client.connect("iot.eclipse.org", 1883, 60)
    client.username_pw_set(args.username, args.password)
    client.connect(args.host, args.port, 60)

    # Blocking call that processes network traffic, dispatches callbacks and
    # handles reconnecting.
    # Other loop*() functions are available that give a threaded interface and a
    # manual interface.
    client.loop_forever()

def main(args):
    greenlets = []
    for i in range(args.num):
        print 'Start:', i
        greenlets.append(gevent.spawn(start_client, args, i))
        time.sleep(0.02)
    gevent.joinall(greenlets)

def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument('-H', '--host', default='127.0.0.1', help='MQTT broker host')
    parser.add_argument('-P', '--port', default=1883, type=int, help='MQTT broker port')
    parser.add_argument('-n', '--num', default=1, type=int, help='Number of workers')
    parser.add_argument('-t', '--topic', default='test/msg', help='Topic name')
    parser.add_argument('-u', '--username', default='mobile', help='Username')
    parser.add_argument('-w', '--password', default='V1QeoW1g', help='Password')
    args = parser.parse_args()
    print 'Args: ', args
    return args

if __name__ == '__main__':
    main(parse_args())
