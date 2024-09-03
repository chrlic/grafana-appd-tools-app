package main

import (
	"fmt"
	"strconv"

	"github.com/grafana/grafana-plugin-sdk-go/backend/log"
)

func asInt(x any) int {

	log.DefaultLogger.Info("converting x to int", "x", x, "typeOf", fmt.Sprintf("%T", x))

	strResult := fmt.Sprintf("%v", x)
	result, err := strconv.Atoi(strResult)
	if err != nil {
		log.DefaultLogger.Error("cannot convert x to int", "x", x, "err", err)
		return -1
	}

	return result
}
