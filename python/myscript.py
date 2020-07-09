import sys

def print_list(packet):
    #global uid_frame
    uid_frame = parse_packet(packet)
    d = dict();  
    
    try:
        d['Namespace'] = uid_frame.namespac
    except:
        pass
    try:
        d['Instance'] = uid_frame.instance
    except:
        pass
    
    try:
        d['TX Power'] = uid_frame.tx_power
        
    except:
        pass
    try:
        d['TX Power'] = uid_frame.tx_power
    except:
        pass
    try:
        d['URL'] = uid_frame.url
    except:
        pass
    try:
        d['Voltage'] = uid_frame.voltage
    except:
        pass
    try:
        d['Temperature'] = uid_frame.temperature
    except:
        pass
    try:
        d['Temperature (8.8 fixed point)'] = uid_frame.temperature_fixed_point
    except:
        pass
    try:
        d['Advertising count'] = uid_frame.advertising_count
    except:
        pass
    try:
        d['Seconds since boot'] = uid_frame.seconds_since_boot
    except:
        pass
    try:
        d['Data'] = uid_frame.encrypted_data
    except:
        pass
    try:
        d['Salt'] = uid_frame.salt
    except:
        pass
    try:
        d['Mic'] = uid_frame.mic
    except:
        pass
    try:
        d['UUID'] = uid_frame.uuid
    except:
        pass
    try:
        d['Major'] = uid_frame.major
    except:
        pass
    try:
        d['Minor'] = uid_frame.minor
    except:
        pass
    try:
        d['TX Power'] = uid_frame.tx_power
    except:
        pass
    try:
        print("UUID: %s" % uid_frame.uuid)
        #d['Instance'] = uid_frame.instance
    except:
        pass
    try:
        print("Major: %d" % uid_frame.major)
        #d['Instance'] = uid_frame.instance
    except:
        pass
    try:
        d['Temperature cypress'] = uid_frame.cypress_temperature
    except:
        pass
    try:
        d['Humidity cypress'] = uid_frame.cypress_humidity
    except:
        pass
    try:
        d['Identifier'] = uid_frame.identifier
    except:
        pass
    try:
        d['Protocol Version'] = uid_frame.protocol_version
    except:
        pass
    try:
        d['Acceleration (g)'] = uid_frame.acceleration
    except:
        pass
    try:
        d['Is moving'] = uid_frame.is_moving
    except:
        pass
    try:
        print("Identifier: %s" % uid_frame.identifier)
        #d['Instance'] = uid_frame.instance
    except:
        pass
    try:
        d['Protocol Version'] = uid_frame.protocol_version
    except:
        pass
    try:
        d['Magnetic field'] = uid_frame.magnetic_field
    except:
        pass
    return d 



print(str('work done'))
sys.stdout.flush()